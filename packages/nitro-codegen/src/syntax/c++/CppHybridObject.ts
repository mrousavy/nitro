import type { SourceFile } from '../SourceFile.js'
import { createFileMetadataString } from '../helpers.js'
import { indent } from '../../stringUtils.js'
import type { HybridObjectSpec } from '../HybridObjectSpec.js'

export function createCppHybridObject(spec: HybridObjectSpec): SourceFile[] {
  // Extra includes
  const extraDefinitions = [
    ...spec.properties.flatMap((p) => p.getDefinitionFiles()),
    ...spec.methods.flatMap((m) => m.getDefinitionFiles()),
  ]
  const cppExtraIncludesAll = extraDefinitions.map(
    (d) => `#include "${d.name}"`
  )
  const cppExtraIncludes = [...new Set(cppExtraIncludesAll)]

  // Generate the full header / code
  const cppHeaderCode = `
${createFileMetadataString(`${spec.hybridObjectName}.hpp`)}

#pragma once

#if __has_include(<NitroModules/HybridObject.hpp>)
#include <NitroModules/HybridObject.hpp>
#else
#error NitroModules cannot be found! Are you sure you installed react-native-nitro properly?
#endif

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
    ${indent(spec.properties.map((p) => p.getCode('c++')).join('\n'), '    ')}

  public:
    // Methods
    ${indent(spec.methods.map((m) => m.getCode('c++')).join('\n'), '    ')}

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
  const signatures = [
    ...spec.properties.flatMap((p) => p.cppSignatures),
    ...spec.methods.map((m) => m.cppSignature),
  ]
  for (const signature of signatures) {
    let registerMethod: string
    switch (signature.type) {
      case 'getter':
        registerMethod = 'registerHybridGetter'
        break
      case 'setter':
        registerMethod = 'registerHybridSetter'
        break
      case 'method':
        registerMethod = 'registerHybridMethod'
        break
      default:
        throw new Error(`Invalid C++ Signature Type: ${signature.type}!`)
    }
    registrations.push(
      `${registerMethod}("${signature.rawName}", &${spec.hybridObjectName}::${signature.name}, this);`
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
  })
  files.push({
    content: cppBodyCode,
    name: `${spec.hybridObjectName}.cpp`,
    language: 'c++',
  })
  files.push(...extraDefinitions)
  return files
}
