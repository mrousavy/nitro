import type { HybridObjectSpec } from '../HybridObjectSpec.js'
import { SwiftCxxBridgedType } from './SwiftCxxBridgedType.js'
import type { Property } from '../Property.js'
import { indent } from '../../utils.js'
import type { Method } from '../Method.js'
import { createFileMetadataString, isNotDuplicate } from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import { getHybridObjectName } from '../getHybridObjectName.js'
import { getForwardDeclaration } from '../c++/getForwardDeclaration.js'
import { NitroConfig } from '../../config/NitroConfig.js'
import { includeHeader, includeNitroHeader } from '../c++/includeNitroHeader.js'

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
  const name = getHybridObjectName(spec.name)

  const propertiesBridge = spec.properties
    .map((p) => getPropertyForwardImplementation(p))
    .join('\n\n')
  const methodsBridge = spec.methods
    .map((m) => getMethodForwardImplementation(m))
    .join('\n\n')

  const swiftCxxWrapperCode = `
${createFileMetadataString(`${name.HybridTSpecCxx}.swift`)}

import Foundation
import NitroModules

/**
 * A class implementation that bridges ${name.HybridTSpec} over to C++.
 * In C++, we cannot use Swift protocols - so we need to wrap it in a class to make it strongly defined.
 *
 * Also, some Swift types need to be bridged with special handling:
 * - Enums need to be wrapped in Structs, otherwise they cannot be accessed bi-directionally (Swift bug: https://github.com/swiftlang/swift/issues/75330)
 * - Other HybridObjects need to be wrapped/unwrapped from the Swift TCxx wrapper
 * - Throwing methods need to be wrapped with a Result<T, Error> type, as exceptions cannot be propagated to C++
 */
public final class ${name.HybridTSpecCxx} {
  private(set) var implementation: ${name.HybridTSpec}

  public init(_ implementation: ${name.HybridTSpec}) {
    self.implementation = implementation
  }

  // HybridObject C++ part
  public var hybridContext: margelo.nitro.HybridContext {
    get {
      return self.implementation.hybridContext
    }
    set {
      self.implementation.hybridContext = newValue
    }
  }

  // Memory size of the Swift class (plus size of any other allocations)
  public var memorySize: Int {
    return self.implementation.memorySize
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
        { inline: true, override: true, noexcept: true },
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
      let body: string
      if (hasResult) {
        // func returns something
        body = `
auto value = _swiftPart.${m.name}(${params});
return ${bridgedReturnType.parseFromSwiftToCpp('value', 'c++')};
        `.trim()
      } else {
        // void func
        body = `
_swiftPart.${m.name}(${params});
        `.trim()
      }

      return m.getCode('c++', { inline: true, override: true }, body)
    })
    .join('\n')

  const allBridgedTypes = [
    ...spec.properties.flatMap((p) => new SwiftCxxBridgedType(p.type)),
    ...spec.methods.flatMap((m) => {
      const bridgedReturn = new SwiftCxxBridgedType(m.returnType)
      const bridgedParams = m.parameters.map(
        (p) => new SwiftCxxBridgedType(p.type)
      )
      return [bridgedReturn, ...bridgedParams]
    }),
  ]
  const extraImports = allBridgedTypes.flatMap((b) => b.getRequiredImports())
  const extraForwardDeclarations = extraImports
    .map((i) => i.forwardDeclaration)
    .filter((v) => v != null)
    .filter(isNotDuplicate)
  const extraIncludes = extraImports
    .map((i) => includeHeader(i))
    .filter(isNotDuplicate)
  const cxxNamespace = NitroConfig.getCxxNamespace('c++')
  const iosModuleName = NitroConfig.getIosModuleName()

  // TODO: Remove forward declaration once Swift fixes the wrong order in generated -Swift.h headers!
  const cppHybridObjectCode = `
${createFileMetadataString(`${name.HybridTSpecSwift}.hpp`)}

#pragma once

#include "${name.HybridTSpec}.hpp"

${getForwardDeclaration('class', name.HybridTSpecCxx, iosModuleName)}

${extraForwardDeclarations.join('\n')}

${extraIncludes.join('\n')}

${includeNitroHeader('HybridContext.hpp')}

#include "${iosModuleName}-Swift-Cxx-Umbrella.hpp"

namespace ${cxxNamespace} {

  /**
   * The C++ part of ${name.HybridTSpecCxx}.swift.
   *
   * ${name.HybridTSpecSwift} (C++) accesses ${name.HybridTSpecCxx} (Swift), and might
   * contain some additional bridging code for C++ <> Swift interop.
   *
   * Since this obviously introduces an overhead, I hope at some point in
   * the future, ${name.HybridTSpecCxx} can directly inherit from the C++ class ${name.HybridTSpec}
   * to simplify the whole structure and memory management.
   */
  class ${name.HybridTSpecSwift} final: public ${name.HybridTSpec} {
  public:
    // Constructor from a Swift instance
    explicit ${name.HybridTSpecSwift}(const ${iosModuleName}::${name.HybridTSpecCxx}& swiftPart): ${name.HybridTSpec}(), _swiftPart(swiftPart) { }

  public:
    // Get the Swift part
    inline ${iosModuleName}::${name.HybridTSpecCxx} getSwiftPart() noexcept { return _swiftPart; }

  public:
    // Get memory pressure
    inline size_t getExternalMemorySize() noexcept override {
      return _swiftPart.getMemorySize();
    }

  public:
    // Properties
    ${indent(cppProperties, '    ')}

  public:
    // Methods
    ${indent(cppMethods, '    ')}

  private:
    ${iosModuleName}::${name.HybridTSpecCxx} _swiftPart;
  };

} // namespace ${cxxNamespace}
  `
  const cppHybridObjectCodeCpp = `
${createFileMetadataString(`${name.HybridTSpecSwift}.cpp`)}

#include "${name.HybridTSpecSwift}.hpp"

namespace ${cxxNamespace} {
} // namespace ${cxxNamespace}
  `

  const files: SourceFile[] = []
  files.push(...allBridgedTypes.flatMap((b) => b.getExtraFiles()))
  files.push({
    content: swiftCxxWrapperCode,
    language: 'swift',
    name: `${name.HybridTSpecCxx}.swift`,
    subdirectory: [],
    platform: 'ios',
  })
  files.push({
    content: cppHybridObjectCode,
    language: 'c++',
    name: `${name.HybridTSpecSwift}.hpp`,
    subdirectory: [],
    platform: 'ios',
  })
  files.push({
    content: cppHybridObjectCodeCpp,
    language: 'c++',
    name: `${name.HybridTSpecSwift}.cpp`,
    subdirectory: [],
    platform: 'ios',
  })
  return files
}

function getPropertyForwardImplementation(property: Property): string {
  const bridgedType = new SwiftCxxBridgedType(property.type)
  const convertToCpp = bridgedType.parseFromSwiftToCpp(
    `self.implementation.${property.name}`,
    'swift'
  )
  const convertFromCpp = bridgedType.parseFromCppToSwift('newValue', 'swift')
  const getter = `
@inline(__always)
get {
  return ${indent(convertToCpp, '  ')}
}
  `.trim()
  const setter = `
@inline(__always)
set {
  self.implementation.${property.name} = ${indent(convertFromCpp, '  ')}
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
  const resultValue = returnType.hasType ? `let result = ` : ''
  const returnValue = returnType.hasType
    ? `${returnType.parseFromSwiftToCpp('result', 'swift')}`
    : ''
  // TODO: Use @inlinable or @inline(__always)?
  return `
@inline(__always)
public func ${method.name}(${params.join(', ')}) -> ${returnType.getTypeCode('swift')} {
  do {
    ${resultValue}try self.implementation.${method.name}(${passParams.join(', ')})
    return ${indent(returnValue, '    ')}
  } catch {
    let message = "\\(error.localizedDescription)"
    fatalError("Swift errors can currently not be propagated to C++! See https://github.com/swiftlang/swift/issues/75290 (Error: \\(message))")
  }
}
  `.trim()
}
