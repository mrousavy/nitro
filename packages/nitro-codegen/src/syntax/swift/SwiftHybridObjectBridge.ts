import type { HybridObjectSpec } from '../HybridObjectSpec.js'
import { SwiftCxxBridgedType } from './SwiftCxxBridgedType.js'
import type { Property } from '../Property.js'
import { indent } from '../../stringUtils.js'
import type { Method } from '../Method.js'
import { createFileMetadataString } from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import { getMethodResultType } from './getMethodResultType.js'
import { getHybridObjectProtocolName } from './getHybridObjectProtocolName.js'
import { getHybridObjectName } from '../c++/getHybridObjectName.js'

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
  spec: HybridObjectSpec
): SourceFile[] {
  const swiftProtocolName = getHybridObjectProtocolName(spec.name)
  const swiftCxxWrapperName = `${swiftProtocolName}Cxx`
  const cxxName = getHybridObjectName(spec.name)
  const cxxSwiftWrapperName = `${cxxName}Swift`

  const bridgedResultTypes = spec.methods.map((m) =>
    getMethodResultType(swiftProtocolName, m)
  )

  const propertiesBridge = spec.properties
    .map((p) => getPropertyForwardImplementation(p))
    .join('\n\n')
  const methodsBridge = spec.methods
    .map((m) => getMethodForwardImplementation(swiftProtocolName, m))
    .join('\n\n')

  const swiftCxxWrapperCode = `
${createFileMetadataString(`${swiftCxxWrapperName}.swift`)}

import Foundation
import NitroModules

/**
 * A class implementation that bridges ${swiftProtocolName} over to C++.
 * In C++, we cannot use Swift protocols - so we need to wrap it in a class to make it strongly defined.
 *
 * Also, some Swift types need to be bridged with special handling:
 * - Enums need to be wrapped in Structs, otherwise they cannot be accessed bi-directionally (Swift bug: https://github.com/swiftlang/swift/issues/75330)
 * - Other HostObjects need to be wrapped/unwrapped from the Swift TCxx wrapper
 * - Throwing methods need to be wrapped with a Result<T, Error> type, as exceptions cannot be propagated to C++
 */
public class ${swiftCxxWrapperName} {
  private(set) var implementation: ${swiftProtocolName}

  public init(_ implementation: ${swiftProtocolName}) {
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
      return p.getCode(
        'c++',
        { inline: true, override: true },
        {
          getter: getter.trim(),
          setter: setter.trim(),
        }
      )
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
      const bridgedReturnType = new SwiftCxxBridgedType(m.returnType)
      const hasResult = m.returnType.kind !== 'void'
      let body = `
auto valueOrError = _swiftPart.${m.name}(${params});
if (valueOrError.isError()) [[unlikely]] {
  throw std::runtime_error(valueOrError.getError());
}
`.trim()
      if (hasResult) {
        body += '\n'
        body += `
auto value = valueOrError.getValue();
`.trim()
        if (bridgedReturnType.needsSpecialHandling) {
          body += '\n'
          body += `
return ${bridgedReturnType.parseFromSwiftToCpp('value', 'c++')};
`.trim()
        } else {
          body += '\n'
          body += 'return value;'
        }
      }
      return m.getCode('c++', { inline: true, override: true }, body)
    })
    .join('\n')

  const cppHybridObjectCode = `
${createFileMetadataString(`${cxxSwiftWrapperName}.hpp`)}

#pragma once

#include "${cxxName}.hpp"
#include "${NAMESPACE}-Swift.h"

/**
 * The C++ part of ${swiftCxxWrapperName}.swift.
 */
class ${cxxSwiftWrapperName} final: public ${cxxName} {
public:
  // Constructor from a Swift instance
  explicit ${cxxSwiftWrapperName}(${NAMESPACE}::${swiftCxxWrapperName} swiftPart): ${cxxName}(), _swiftPart(swiftPart) { }

public:
  // Get the Swift part
  inline ${NAMESPACE}::${swiftCxxWrapperName} getSwiftPart() { return _swiftPart; }

public:
  // Properties
  ${indent(cppProperties, '  ')}

public:
  // Methods
  ${indent(cppMethods, '  ')}

private:
  ${NAMESPACE}::${swiftCxxWrapperName} _swiftPart;
};
  `
  const cppHybridObjectCodeCpp = `
${createFileMetadataString(`${cxxSwiftWrapperName}.cpp`)}

#include "${cxxSwiftWrapperName}.hpp"
  `

  const files: SourceFile[] = []
  files.push({
    content: swiftCxxWrapperCode,
    language: 'swift',
    name: `${swiftCxxWrapperName}.swift`,
    platform: 'ios',
  })
  for (const resultType of bridgedResultTypes) {
    files.push({
      content: resultType.swiftEnumCode,
      language: 'swift',
      name: `${resultType.typename}.swift`,
      platform: 'ios',
    })
  }
  files.push({
    content: cppHybridObjectCode,
    language: 'c++',
    name: `${cxxSwiftWrapperName}.hpp`,
    platform: 'ios',
  })
  files.push({
    content: cppHybridObjectCodeCpp,
    language: 'c++',
    name: `${cxxSwiftWrapperName}.cpp`,
    platform: 'ios',
  })
  return files
}

function getPropertyForwardImplementation(property: Property): string {
  const bridgedType = new SwiftCxxBridgedType(property.type)
  const getter = `
@inline(__always)
get {
  return ${bridgedType.parseFromSwiftToCpp(`self.implementation.${property.name}`, 'swift')}
}
  `.trim()
  const setter = `
@inline(__always)
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

function getMethodForwardImplementation(
  moduleName: string,
  method: Method
): string {
  const returnType = new SwiftCxxBridgedType(method.returnType)
  const params = method.parameters.map((p) => {
    const bridgedType = new SwiftCxxBridgedType(p.type)
    return `${p.name}: ${bridgedType.getTypeCode('swift')}`
  })
  const passParams = method.parameters.map((p) => {
    const bridgedType = new SwiftCxxBridgedType(p.type)
    return `${p.name}: ${bridgedType.parseFromCppToSwift(p.name, 'swift')}`
  })
  const resultType = getMethodResultType(moduleName, method)
  const resultValue = resultType.hasType ? `let result =` : ''
  const returnValue = resultType.hasType
    ? `.value(${returnType.parseFromSwiftToCpp('result', 'swift')})`
    : '.value'
  // TODO: Use @inlinable or @inline(__always)?
  return `
@inline(__always)
public func ${method.name}(${params.join(', ')}) -> ${resultType.typename} {
  do {
    ${resultValue} try self.implementation.${method.name}(${passParams.join(', ')})
    return ${returnValue}
  } catch RuntimeError.error(withMessage: let message) {
    // A  \`RuntimeError\` was thrown.
    return .error(message: message)
  } catch {
    // Any other kind of error was thrown.
    // Due to a Swift bug, we have to copy the string here.
    let message = "\\(error.localizedDescription)"
    return .error(message: message)
  }
}
  `.trim()
}
