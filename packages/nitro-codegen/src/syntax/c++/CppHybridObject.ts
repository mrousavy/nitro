import type { SourceFile } from '../SourceFile.js'
import { createFileMetadataString, isNotDuplicate } from '../helpers.js'
import { indent } from '../../stringUtils.js'
import type { HybridObjectSpec } from '../HybridObjectSpec.js'

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

  // Generate the full header / code
  const cppHeaderCode = `
${createFileMetadataString(`${spec.hybridObjectName}.hpp`)}

#pragma once

#if __has_include(<NitroModules/HybridObject.hpp>)
#include <NitroModules/HybridObject.hpp>
#else
#error NitroModules cannot be found! Are you sure you installed react-native-nitro properly?
#endif

${cppForwardDeclarations.join('\n')}

${cppExtraIncludes.join('\n')}

using namespace margelo::nitro;

/**
 * An abstract base class for \`${spec.name}\`
 * Inherit this class to create instances of \`${spec.hybridObjectName}\` in C++.
 * @example
 * \`\`\`cpp
 * class ${spec.name}: public ${spec.hybridObjectName} {
 *   // ...
 * };
 * \`\`\`
 */
class ${spec.hybridObjectName}: public HybridObject {
  public:
    // Constructor
    explicit ${spec.hybridObjectName}(): HybridObject(TAG) { }

  public:
    // Properties
    ${indent(spec.properties.map((p) => p.getCode('c++', { virtual: true })).join('\n'), '    ')}

  public:
    // Methods
    ${indent(spec.methods.map((m) => m.getCode('c++', { virtual: true })).join('\n'), '    ')}

  protected:
    // Tag for logging
    static constexpr auto TAG = "${spec.name}";

  private:
    // Hybrid Setup
    void loadHybridMethods() override;
};
    `

  // Each C++ method needs to be registered in the HybridObject - that's getters, setters and normal methods.
  const registrations: string[] = []
  for (const property of spec.properties) {
    // getter
    registrations.push(
      `registerHybridGetter("${property.name}", &${spec.hybridObjectName}::${property.cppGetterName}, this);`
    )
    if (!property.isReadonly) {
      // setter
      registrations.push(
        `registerHybridSetter("${property.name}", &${spec.hybridObjectName}::${property.cppSetterName}, this);`
      )
    }
  }
  for (const method of spec.methods) {
    // method
    registrations.push(
      `registerHybridMethod("${method.name}", &${spec.hybridObjectName}::${method.name}, this);`
    )
  }

  const cppBodyCode = `
${createFileMetadataString(`${spec.hybridObjectName}.cpp`)}

#include "${spec.hybridObjectName}.hpp"

void ${spec.hybridObjectName}::loadHybridMethods() {
  // load base methods/properties
  HybridObject::loadHybridMethods();
  // load custom methods/properties
  ${indent(registrations.join('\n'), '  ')}
}
    `

  const files: SourceFile[] = []
  files.push({
    content: cppHeaderCode,
    name: `${spec.hybridObjectName}.hpp`,
    language: 'c++',
    platform: 'shared',
  })
  files.push({
    content: cppBodyCode,
    name: `${spec.hybridObjectName}.cpp`,
    language: 'c++',
    platform: 'shared',
  })
  files.push(...extraFiles)
  return files
}
