import { indent } from '../../stringUtils.js'
import { createFileMetadataString } from '../helpers.js'
import type { HybridObjectSpec } from '../HybridObjectSpec.js'
import { Method } from '../Method.js'
import type { Property } from '../Property.js'
import type { SourceFile } from '../SourceFile.js'
import { SwiftCxxBridgedType } from './SwiftCxxBridgedType.js'

// TODO: dynamically get namespace
const NAMESPACE = 'NitroImage'

function getPropertyForwardImplementation(property: Property): string {
  const bridgedType = new SwiftCxxBridgedType(property.type)
  const getter = `
get {
  return ${bridgedType.toCpp(`self.implementation.${property.name}`)}
}
  `.trim()
  const setter = `
set {
  self.implementation.${property.name} = ${bridgedType.fromCpp('newValue')}
}
  `.trim()

  const body = [getter]
  if (!property.isReadonly) {
    body.push(setter)
  }

  const code = `
public var ${property.name}: ${bridgedType.getSwiftCode()} {
  ${indent(body.join('\n'), '  ')}
}
  `
  return code.trim()
}

function getMethodForwardImplementation(method: Method): string {
  const returnType = new SwiftCxxBridgedType(method.returnType)
  const params = method.parameters.map((p) => {
    const bridgedType = new SwiftCxxBridgedType(p.type)
    return `${p.name}: ${bridgedType.getSwiftCode()}`
  })
  const passParams = method.parameters.map((p) => {
    const bridgedType = new SwiftCxxBridgedType(p.type)
    return `${p.name}: ${bridgedType.fromCpp(p.name)}`
  })
  return `
public func ${method.name}(${params.join(', ')}) -> Result<${returnType.getSwiftCode()}, Error> {
  do {
    let result = try self.implementation.${method.name}(${passParams.join(', ')})
    return .success(${returnType.toCpp('result')})
  } catch {
    return .failure(error)
  }
}
  `.trim()
}

export function createSwiftHybridObject(spec: HybridObjectSpec): SourceFile[] {
  const protocolName = `${spec.name}Spec`
  const properties = spec.properties.map((p) => p.getCode('swift')).join('\n')
  const methods = spec.methods.map((p) => p.getCode('swift')).join('\n')

  const protocolCode = `
${createFileMetadataString(`${protocolName}.swift`)}

import Foundation
import NitroModules

/**
 * A Swift protocol representing the ${spec.name} HybridObject.
 * Implement this protocol to create Swift-based instances of ${spec.name}.
 *
 * When implementing this protocol, make sure to initialize \`hybridContext\` - example:
 * \`\`\`
 * public class ${spec.name} : ${protocolName} {
 *   // Initialize HybridContext
 *   var hybridContext = margelo.nitro.HybridContext()
 *
 *   // ...
 * }
 * \`\`\`
 */
public protocol ${protocolName} {
  // Nitro Modules Hybrid Context
  var hybridContext: margelo.nitro.HybridContext { get set }

  // Properties
  ${indent(properties, '  ')}

  // Methods
  ${indent(methods, '  ')}
}
  `

  const propertiesBridge = spec.properties
    .map((p) => getPropertyForwardImplementation(p))
    .join('\n\n')
  const methodsBridge = spec.methods
    .map((m) => getMethodForwardImplementation(m))
    .join('\n\n')

  const swiftBridgeCode = `
${createFileMetadataString(`${protocolName}Cxx.swift`)}

import Foundation
import NitroModules

/**
 * A class implementation that bridges ${protocolName} over to C++.
 * In C++, we cannot use Swift protocols - so we need to wrap it in a class to make it strongly defined.
 *
 * Also, some Swift types need to be bridged with special handling:
 * - Enums need to be wrapped in Structs, otherwise they cannot be accessed bi-directionally (Swift bug: https://github.com/swiftlang/swift/issues/75330)
 * - Other HostObjects need to be wrapped/unwrapped from the Swift TCxx wrapper
 * - Throwing methods need to be wrapped with a Result<T, Error> type, as exceptions cannot be propagated to C++
 */
public class ${protocolName}Cxx {
  private let implementation: ${protocolName}

  public init(_ implementation: ${protocolName}) {
    self.implementation = implementation
  }

  // Properties
  ${indent(propertiesBridge, '  ')}

  // Methods
  ${indent(methodsBridge, '  ')}
}

  `

  const cppProperties = spec.properties
    .map((p) => {
      return p.getCode('c++', {
        getter: `return _swiftPart.${p.cppGetterName}();`,
        setter: `_swiftPart.${p.cppSetterName}(std::forward(${p.name}));`,
      })
    })
    .join('\n')
  const cppMethods = spec.methods
    .map((m) => {
      const params = m.parameters
        .map((p) => `std::forward(${p.name}`)
        .join(', ')
      const body = `return _swiftPart.${m.name}(${params});`
      return m.getCode('c++', body)
    })
    .join('\n')
  const cppHybridObjectCode = `
${createFileMetadataString(`Hybrid${spec.name}Swift.hpp`)}

#pragma once

#include "Hybrid${spec.name}.hpp"
#include "${NAMESPACE}-Swift.h"

class Hybrid${spec.name}Swift: public Hybrid${spec.name} {
public:
  // Constructor from a Swift instance
  explicit Hybrid${spec.name}Swift(${NAMESPACE}::${protocolName}Cxx swiftPart): Hybrid${spec.name}(), _swiftPart(swiftPart) { }

public:
  // Properties
  ${indent(cppProperties, '  ')}

public:
  // Methods
  ${indent(cppMethods, '  ')}

private:
  ${NAMESPACE}::${protocolName}Cxx _swiftPart;
};
  `
  const cppHybridObjectCodeCpp = `
${createFileMetadataString(`Hybrid${spec.name}Swift.cpp`)}

#include "Hybrid${spec.name}Swift.hpp"
  `

  const files: SourceFile[] = []
  files.push({
    content: protocolCode,
    language: 'swift',
    name: `${protocolName}.swift`,
    platform: 'ios',
  })
  files.push({
    content: swiftBridgeCode,
    language: 'swift',
    name: `${protocolName}Cxx.swift`,
    platform: 'ios',
  })
  files.push({
    content: cppHybridObjectCode,
    language: 'c++',
    name: `Hybrid${spec.name}Swift.hpp`,
    platform: 'ios',
  })
  files.push({
    content: cppHybridObjectCodeCpp,
    language: 'c++',
    name: `Hybrid${spec.name}Swift.cpp`,
    platform: 'ios',
  })
  return files
}
