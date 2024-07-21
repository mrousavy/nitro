import type { HybridObjectSpec } from '../HybridObjectSpec.js'
import { SwiftCxxBridgedType } from './SwiftCxxBridgedType.js'
import type { Property } from '../Property.js'
import { indent } from '../../stringUtils.js'
import type { Method } from '../Method.js'
import { createFileMetadataString } from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'

// TODO: dynamically get namespace
const NAMESPACE = 'NitroImage'

/**
 * Creates a Swift class that bridges Swift over to C++.
 * We need this because not all Swift types are accessible in C++, and vice versa.
 *
 * For example, Enums need to be converted to Int32 (because of a Swift compiler bug),
 * std::future<..> has to be converted to a Promise<..>, exceptions have to be handled
 * via custom Result types, etc..
 */
export function createSwiftHybridObjectCxxBridge(
  protocolName: string,
  spec: HybridObjectSpec
): SourceFile[] {
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
  private var implementation: ${protocolName}

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
      const bridged = new SwiftCxxBridgedType(p.type)
      let getter: string
      let setter: string

      if (bridged.needsSpecialHandling) {
        // we need custom C++ -> Swift conversion code
        getter = `
auto result = _swiftPart.${p.cppGetterName}();
return ${bridged.parseFromSwiftToCpp('result', 'c++')};
`
        setter = `_swiftPart.${p.cppSetterName}(${bridged.parseFromCppToSwift(p.name, 'c++')});`
      } else {
        // just forward value directly
        getter = `return _swiftPart.${p.cppGetterName}();`
        setter = `_swiftPart.${p.cppSetterName}(std::forward<decltype(${p.name})>(${p.name}));`
      }
      return p.getCode('c++', {
        getter: getter.trim(),
        setter: setter.trim(),
      })
    })
    .join('\n')
  const cppMethods = spec.methods
    .map((m) => {
      const params = m.parameters
        .map((p) => {
          const bridged = new SwiftCxxBridgedType(p.type)
          if (bridged.needsSpecialHandling) {
            // we need custom C++ -> Swift conversion code
            return bridged.parseFromCppToSwift(p.name, 'c++')
          } else {
            // just forward value directly
            return `std::forward<decltype(${p.name})>(${p.name})`
          }
        })
        .join(', ')
      let body: string
      const bridgedReturnType = new SwiftCxxBridgedType(m.returnType)
      if (bridgedReturnType.needsSpecialHandling) {
        body = `
auto result = _swiftPart.${m.name}(${params});
return ${bridgedReturnType.parseFromSwiftToCpp('result', 'c++')}
        `
      } else {
        body = `return _swiftPart.${m.name}(${params});`
      }
      return m.getCode('c++', body)
    })
    .join('\n')
  const cppHybridObjectCode = `
${createFileMetadataString(`Hybrid${spec.name}Swift.hpp`)}

#pragma once

#include "Hybrid${spec.name}.hpp"
#include "${NAMESPACE}-Swift.h"

/**
 * The C++ part of ${protocolName}Cxx.swift.
 */
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

function getPropertyForwardImplementation(property: Property): string {
  const bridgedType = new SwiftCxxBridgedType(property.type)
  const getter = `
get {
  return ${bridgedType.parseFromSwiftToCpp(`self.implementation.${property.name}`, 'swift')}
}
  `.trim()
  const setter = `
set {
  self.implementation.${property.name} = ${bridgedType.parseFromCppToSwift('newValue', 'swift')}
}
  `.trim()

  const body = [getter]
  if (!property.isReadonly) {
    body.push(setter)
  }

  const code = `
public var ${property.name}: ${bridgedType.getTypeCode('swift')} {
  ${indent(body.join('\n'), '  ')}
}
  `
  return code.trim()
}

function getMethodForwardImplementation(method: Method): string {
  const returnType = new SwiftCxxBridgedType(method.returnType)
  const params = method.parameters.map((p) => {
    const bridgedType = new SwiftCxxBridgedType(p.type)
    return `${p.name}: ${bridgedType.getTypeCode('swift')}`
  })
  const passParams = method.parameters.map((p) => {
    const bridgedType = new SwiftCxxBridgedType(p.type)
    return `${p.name}: ${bridgedType.parseFromCppToSwift(p.name, 'swift')}`
  })
  return `
public func ${method.name}(${params.join(', ')}) -> Result<${returnType.getTypeCode('swift')}, Error> {
  do {
    let result = try self.implementation.${method.name}(${passParams.join(', ')})
    return .success(${returnType.parseFromSwiftToCpp('result', 'swift')})
  } catch {
    return .failure(error)
  }
}
  `.trim()
}
