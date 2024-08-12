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
      return p.getCode(
        'c++',
        { inline: true, override: true, noexcept: true },
        {
          getter: `return _swiftPart.${p.cppGetterName}();`,
          setter: `_swiftPart.${p.cppSetterName}(std::forward<decltype(${p.name})>(${p.name}));`,
        }
      )
    })
    .join('\n')

  const cppMethods = spec.methods
    .map((m) => {
      const params = m.parameters
        .map((p) => `std::forward<decltype(${p.name})>(${p.name})`)
        .join(', ')
      const bridgedReturnType = new SwiftCxxBridgedType(m.returnType)
      let body: string
      if (bridgedReturnType.hasType) {
        // We have a return value, call func, and then convert the `result` from Swift
        body = `return _swiftPart.${m.name}(${params});`
      } else {
        // No return (void), just call func
        body = `_swiftPart.${m.name}(${params});`
      }
      return m.getCode('c++', { inline: true, override: true }, body.trim())
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
  files.push(...allBridgedTypes.flatMap((t) => t.getExtraFiles()))
  return files
}

function getPropertyForwardImplementation(property: Property): string {
  const bridgedType = new SwiftCxxBridgedType(property.type)
  const getter = `
@inline(__always)
get {
  return self.implementation.${property.name}
}
  `.trim()
  const setter = `
@inline(__always)
set {
  self.implementation.${property.name} = newValue
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
    return `${p.name}: ${p.name}`
  })
  let body: string
  if (returnType.hasType) {
    // We have a return value, call func, and then convert the `result` to C++
    body = `return try self.implementation.${method.name}(${passParams.join(', ')})`
  } else {
    // No return (void), just call func
    body = `try self.implementation.${method.name}(${passParams.join(', ')})`
  }

  // TODO: Use @inlinable or @inline(__always)?
  return `
@inline(__always)
public func ${method.name}(${params.join(', ')}) -> ${returnType.getTypeCode('swift')} {
  do {
    ${indent(body.trim(), '    ')}
  } catch {
    // TODO: Wait for https://github.com/swiftlang/swift/issues/75290
    fatalError("Swift errors cannot be propagated to C++ yet! If you want to throw errors, consider using a Promise (async) or a variant type (sync) instead.")
  }
}
  `.trim()
}
