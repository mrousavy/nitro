import type { SourceFile } from '../SourceFile.js'
import { createFileMetadataString, isNotDuplicate } from '../helpers.js'
import { indent } from '../../stringUtils.js'
import type { HybridObjectSpec } from '../HybridObjectSpec.js'
import { includeNitroHeader } from './includeNitroHeader.js'
import { NitroConfig } from '../../config/NitroConfig.js'
import { getHybridObjectName } from '../getHybridObjectName.js'

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
    .map((i) => `#include "${i.name}"`)
    .filter(isNotDuplicate)
  const cxxNamespace = NitroConfig.getCxxNamespace('c++')
  const name = getHybridObjectName(spec.name)

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
   * @example
   * \`\`\`cpp
   * class ${name.HybridT}: public ${name.HybridTSpec} {
   *   // ...
   * };
   * \`\`\`
   */
  class ${name.HybridTSpec}: public HybridObject {
    public:
      // Constructor
      explicit ${name.HybridTSpec}(): HybridObject(TAG) { }

      // Destructor
      ~${name.HybridTSpec}() { }

    public:
      // Properties
      ${indent(spec.properties.map((p) => p.getCode('c++', { virtual: true })).join('\n'), '      ')}

    public:
      // Methods
      ${indent(spec.methods.map((m) => m.getCode('c++', { virtual: true })).join('\n'), '      ')}

    protected:
      // Tag for logging
      static constexpr auto TAG = "${spec.name}";

    private:
      // Hybrid Setup
      void loadHybridMethods() override;
  };

} // namespace ${cxxNamespace}
    `

  // Each C++ method needs to be registered in the HybridObject - that's getters, setters and normal methods.
  const registrations: string[] = []
  for (const property of spec.properties) {
    // getter
    registrations.push(
      `registerHybridGetter("${property.name}", &${name.HybridTSpec}::${property.cppGetterName}, this);`
    )
    if (!property.isReadonly) {
      // setter
      registrations.push(
        `registerHybridSetter("${property.name}", &${name.HybridTSpec}::${property.cppSetterName}, this);`
      )
    }
  }
  for (const method of spec.methods) {
    // method
    registrations.push(
      `registerHybridMethod("${method.name}", &${name.HybridTSpec}::${method.name}, this);`
    )
  }

  const cppBodyCode = `
${createFileMetadataString(`${name.HybridTSpec}.cpp`)}

#include "${name.HybridTSpec}.hpp"

namespace ${cxxNamespace} {

  void ${name.HybridTSpec}::loadHybridMethods() {
    // load base methods/properties
    HybridObject::loadHybridMethods();
    // load custom methods/properties
    ${indent(registrations.join('\n'), '    ')}
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
