import type { MethodSignature, PropertySignature } from 'ts-morph'
import type { File } from './File.js'
import { Property } from './Property.js'
import { Method } from './Method.js'
import { createFileMetadataString } from './helpers.js'
import { indent } from '../stringUtils.js'

export function createCppHybridObject(
  interfaceName: string,
  sourceFile: string,
  properties: PropertySignature[],
  methods: MethodSignature[]
): File[] {
  const cppClassName = `Hybrid${interfaceName}`

  // Properties (getters + setters)
  const cppProperties = properties.map((p) => new Property(p))

  // Functions
  const cppMethods = methods.map((f) => new Method(f))

  // Extra includes
  const extraDefinitions = [
    ...cppProperties.flatMap((p) => p.getDefinitionFiles()),
    ...cppMethods.flatMap((m) => m.getDefinitionFiles()),
  ]
  const cppExtraIncludesAll = extraDefinitions.map(
    (d) => `#include "${d.name}"`
  )
  const cppExtraIncludes = [...new Set(cppExtraIncludesAll)]

  // Generate the full header / code
  const cppHeaderCode = `
${createFileMetadataString(`${cppClassName}.hpp`)}

#pragma once

#if __has_include(<NitroModules/HybridObject.hpp>)
#include <NitroModules/HybridObject.hpp>
#else
#error NitroModules cannot be found! Are you sure you installed react-native-nitro properly?
#endif

${cppExtraIncludes.join('\n')}

using namespace margelo::nitro;

/**
 * An abstract base class for \`${interfaceName}\` (${sourceFile})
 * Inherit this class to create instances of \`${cppClassName}\` in C++.
 * @example
 * \`\`\`cpp
 * class ${interfaceName}: public ${cppClassName} {
 *   // ...
 * };
 * \`\`\`
 */
class ${cppClassName}: public HybridObject {
  public:
    // Constructor
    explicit ${cppClassName}(): HybridObject(TAG) { }

  public:
    // Properties
    ${indent(cppProperties.map((p) => p.getCode('c++')).join('\n'), '    ')}

  public:
    // Methods
    ${indent(cppMethods.map((m) => m.getCode('c++')).join('\n'), '    ')}

  protected:
    // Tag for logging
    static constexpr auto TAG = "${interfaceName}";

  private:
    // Hybrid Setup
    void loadHybridMethods() override;
};
    `

  // Each C++ method needs to be registered in the HybridObject - that's getters, setters and normal methods.
  const registrations: string[] = []
  const signatures = [
    ...cppProperties.flatMap((p) => p.cppSignatures),
    ...cppMethods.map((m) => m.cppSignature),
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
      `${registerMethod}("${signature.rawName}", &${cppClassName}::${signature.name}, this);`
    )
  }

  const cppBodyCode = `
${createFileMetadataString(`${cppClassName}.cpp`)}

#include "${cppClassName}.hpp"

void ${cppClassName}::loadHybridMethods() {
  // load base methods/properties
  HybridObject::loadHybridMethods();
  // load custom methods/properties
  ${indent(registrations.join('\n'), '  ')}
}
    `

  const files: File[] = []
  files.push({
    content: cppHeaderCode,
    name: `${cppClassName}.hpp`,
    language: 'c++',
  })
  files.push({
    content: cppBodyCode,
    name: `${cppClassName}.cpp`,
    language: 'c++',
  })
  files.push(...extraDefinitions)
  return files
}
