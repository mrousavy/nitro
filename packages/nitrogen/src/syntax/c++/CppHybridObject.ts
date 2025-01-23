import type { SourceFile } from '../SourceFile.js'
import { createFileMetadataString, isNotDuplicate } from '../helpers.js'
import { indent } from '../../utils.js'
import type { HybridObjectSpec } from '../HybridObjectSpec.js'
import { includeHeader, includeNitroHeader } from './includeNitroHeader.js'
import { NitroConfig } from '../../config/NitroConfig.js'
import { getHybridObjectName } from '../getHybridObjectName.js'
import { HybridObjectType } from '../types/HybridObjectType.js'

export function createCppHybridObject(spec: HybridObjectSpec): SourceFile[] {
  // Extra includes
  const extraFiles = [
    ...spec.properties.flatMap((p) => p.getExtraFiles()),
    ...spec.methods.flatMap((m) => m.getExtraFiles()),
  ]
  const extraIncludes = [
    ...spec.properties.flatMap((p) => p.getRequiredImports()),
    ...spec.methods.flatMap((m) => m.getRequiredImports()),
  ]
  const cppForwardDeclarations = extraIncludes
    .map((i) => i.forwardDeclaration)
    .filter((v) => v != null)
    .filter(isNotDuplicate)
  const cppExtraIncludes = extraIncludes
    .map((i) => includeHeader(i))
    .filter(isNotDuplicate)
  const cxxNamespace = NitroConfig.getCxxNamespace('c++')
  const name = getHybridObjectName(spec.name)

  const bases = ['public virtual HybridObject']
  for (const base of spec.baseTypes) {
    const hybridObject = new HybridObjectType(base)
    bases.push(`public virtual ${getHybridObjectName(base.name).HybridTSpec}`)
    const imports = hybridObject.getRequiredImports()
    cppForwardDeclarations.push(
      ...imports.map((i) => i.forwardDeclaration).filter((f) => f != null)
    )
    cppExtraIncludes.push(...imports.map((i) => includeHeader(i)))
  }

  // Generate the full header / code
  const cppHeaderCode = `
${createFileMetadataString(`${name.HybridTSpec}.hpp`)}

#pragma once

${includeNitroHeader('HybridObject.hpp')}

${cppForwardDeclarations.join('\n')}

${cppExtraIncludes.join('\n')}

namespace ${cxxNamespace} {

  using namespace margelo::nitro;

  /**
   * An abstract base class for \`${spec.name}\`
   * Inherit this class to create instances of \`${name.HybridTSpec}\` in C++.
   * You must explicitly call \`HybridObject\`'s constructor yourself, because it is virtual.
   * @example
   * \`\`\`cpp
   * class ${name.HybridT}: public ${name.HybridTSpec} {
   * public:
   *   ${name.HybridT}(...): HybridObject(TAG) { ... }
   *   // ...
   * };
   * \`\`\`
   */
  class ${name.HybridTSpec}: ${bases.join(', ')} {
    public:
      // Constructor
      explicit ${name.HybridTSpec}(): HybridObject(TAG) { }

      // Destructor
      ~${name.HybridTSpec}() override = default;

    public:
      // Properties
      ${indent(spec.properties.map((p) => p.getCode('c++', { virtual: true })).join('\n'), '      ')}

    public:
      // Methods
      ${indent(spec.methods.map((m) => m.getCode('c++', { virtual: true })).join('\n'), '      ')}

    protected:
      // Hybrid Setup
      void loadHybridMethods() override;

    protected:
      // Tag for logging
      static constexpr auto TAG = "${spec.name}";
  };

} // namespace ${cxxNamespace}
    `

  // Each C++ method needs to be registered in the HybridObject - that's getters, setters and normal methods.
  const registrations: string[] = []
  for (const property of spec.properties) {
    const getterMethod = property.getCppGetterName('other')
    const setterMethod = property.getCppSetterName('other')
    // getter
    registrations.push(
      `prototype.registerHybridGetter("${property.name}", &${name.HybridTSpec}::${getterMethod});`
    )
    if (!property.isReadonly) {
      // setter
      registrations.push(
        `prototype.registerHybridSetter("${property.name}", &${name.HybridTSpec}::${setterMethod});`
      )
    }
  }
  for (const method of spec.methods) {
    // method
    registrations.push(
      `prototype.registerHybridMethod("${method.name}", &${name.HybridTSpec}::${method.name});`
    )
  }

  const basePrototypeRegistrations = ['HybridObject::loadHybridMethods();']
  for (const base of spec.baseTypes) {
    const hybridObjectName = getHybridObjectName(base.name)
    basePrototypeRegistrations.push(
      `${hybridObjectName.HybridTSpec}::loadHybridMethods();`
    )
  }

  const cppBodyCode = `
${createFileMetadataString(`${name.HybridTSpec}.cpp`)}

#include "${name.HybridTSpec}.hpp"

namespace ${cxxNamespace} {

  void ${name.HybridTSpec}::loadHybridMethods() {
    // load base methods/properties
    ${indent(basePrototypeRegistrations.join('\n'), '    ')}
    // load custom methods/properties
    registerHybrids(this, [](Prototype& prototype) {
      ${indent(registrations.join('\n'), '      ')}
    });
  }

} // namespace ${cxxNamespace}
    `

  const files: SourceFile[] = []
  files.push({
    content: cppHeaderCode,
    name: `${name.HybridTSpec}.hpp`,
    subdirectory: [],
    language: 'c++',
    platform: 'shared',
  })
  files.push({
    content: cppBodyCode,
    name: `${name.HybridTSpec}.cpp`,
    subdirectory: [],
    language: 'c++',
    platform: 'shared',
  })
  files.push(...extraFiles)
  return files
}
