import type { HybridObjectSpec } from '../HybridObjectSpec.js'
import { SwiftCxxBridgedType } from './SwiftCxxBridgedType.js'
import { indent } from '../../utils.js'
import { createFileMetadataString, isNotDuplicate } from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'

import { getHybridObjectName } from '../getHybridObjectName.js'
import { getForwardDeclaration } from '../c++/getForwardDeclaration.js'
import { NitroConfig } from '../../config/NitroConfig.js'
import { includeHeader, includeNitroHeader } from '../c++/includeNitroHeader.js'
import { createSwiftInterfaceWrapper } from './SwiftInterfaceWrapper.js'
import { SwiftType } from './SwiftType.js'

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

  const cppSwiftProperties = spec.properties
    .map((p) => {
      const swiftBridge = new SwiftType(p.type)
      const lines: string[] = []
      // getter
      lines.push(
        `
inline ${swiftBridge.getCode('c++')} ${p.cppGetterName}_swift() noexcept {
  return _swiftPart.${p.cppGetterName}();
}`
      )
      if (!p.isReadonly) {
        lines.push(
          `
inline void ${p.cppSetterName}_swift(${swiftBridge.getCode('c++')} newValue) noexcept {
  _swiftPart.${p.cppSetterName}(newValue);
}`
        )
      }
      return lines.join('\n').trim()
    })
    .join('\n')
  const cppSwiftMethods = spec.methods
    .map((m) => {
      const swiftBridgeReturn = new SwiftType(m.returnType)
      const params = m.parameters.map((p) => {
        const swiftBridgedParameter = new SwiftType(p.type)
        return `${swiftBridgedParameter.getCode('c++')} ${p.name}`
      })
      const forwardParams = m.parameters.map((p) => `${p.name}`)
      return `
inline ${swiftBridgeReturn.getCode('c++')} ${m.name}_swift(${params}) noexcept {
  return _swiftPart.${m.name}(${forwardParams});
}
`.trim()
    })
    .join('\n')
  const registrations: string[] = []
  for (const property of spec.properties) {
    // getter
    registrations.push(
      `prototype.registerHybridGetter("${property.name}", &${name.HybridTSpecSwift}::${property.cppGetterName}_swift);`
    )
    if (!property.isReadonly) {
      // setter
      registrations.push(
        `prototype.registerHybridSetter("${property.name}", &${name.HybridTSpecSwift}::${property.cppSetterName}_swift);`
      )
    }
  }
  for (const method of spec.methods) {
    // method
    registrations.push(
      `prototype.registerHybridMethod("${method.name}", &${name.HybridTSpecSwift}::${method.name}_swift);`
    )
  }

  const inheritedPropertiesStubs = spec.properties
    .map((p) => {
      return p.getCode(
        'c++',
        { inline: true, override: true },
        {
          getter: `throw std::runtime_error("\\"${p.name}\\" is implemented in Swift, and Nitro does currently not bridge between Swift and C++!");`,
          setter: `throw std::runtime_error("\\"${p.name}\\" is implemented in Swift, and Nitro does currently not bridge between Swift and C++!");`,
        }
      )
    })
    .join('\n')

  const inheritedMethodsStubs = spec.methods
    .map((m) => {
      return m.getCode(
        'c++',
        { inline: true, override: true },
        `throw std::runtime_error("\\"${m.name}(..)\\" is implemented in Swift, and Nitro does currently not bridge between Swift and C++!");`
      )
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

${includeNitroHeader('JSIConverter+Swift.hpp')}

namespace ${cxxNamespace} {

  /**
   * The C++ part of ${name.HybridTSpecCxx}.swift.
   *
   * ${name.HybridTSpecSwift} (C++) accesses ${name.HybridTSpecCxx} (Swift), and exposes
   * Swift types directly to JSI using \`JSIConverter<T>\` overloads from "JSIConverter+Swift.hpp".
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
    // Properties using Swift types
    ${indent(cppSwiftProperties, '    ')}

  public:
    // Methods using Swift types
    ${indent(cppSwiftMethods, '    ')}

  public:
    void loadHybridMethods() override {
      // load base methods/properties
      ${name.HybridTSpec}::loadHybridMethods();
      // load custom methods/properties
      registerHybrids(this, [](Prototype& prototype) {
        ${indent(registrations.join('\n'), '        ')}
      });
    }

  public:
    // Properties inherited from base, currently throwing
    ${indent(inheritedPropertiesStubs, '    ')}

  public:
    // Methods inherited from base, currently throwing
    ${indent(inheritedMethodsStubs, '    ')}

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

  const swiftInterfaceWrapper = createSwiftInterfaceWrapper(spec)

  const files: SourceFile[] = []
  files.push(swiftInterfaceWrapper)
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
