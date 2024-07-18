import type { PlatformSpec } from 'react-native-nitro-modules'
import type { Platform } from './getPlatformSpecs.js'
import { type InterfaceDeclaration, type MethodSignature } from 'ts-morph'
import { indent } from './stringUtils.js'
import { Property } from './syntax/Property.js'
import { Method } from './syntax/Method.js'
import { createFileMetadataString } from './syntax/helpers.js'
import type { File } from './syntax/File.js'

export function createPlatformSpec<
  TPlatform extends Platform,
  TLanguage extends PlatformSpec[TPlatform],
>(
  module: InterfaceDeclaration,
  platform: TPlatform,
  language: TLanguage
): File[] {
  switch (platform) {
    case 'ios':
      switch (language) {
        case 'swift':
          return createAppleSwiftSpec(module)
        case 'c++':
          return createSharedCppSpec(module)
        default:
          throw new Error(`${language} is not supported on ${platform}!`)
      }
    case 'android':
      switch (language) {
        case 'kotlin':
          return createAndroidKotlinSpec(module)
        case 'c++':
          return createSharedCppSpec(module)
        default:
          throw new Error(`${language} is not supported on ${platform}!`)
      }
    default:
      throw new Error(`${platform} is not supported!`)
  }
}

function getDuplicates<T>(array: T[]): T[] {
  const duplicates = new Set<T>()
  for (let i = 0; i < array.length; i++) {
    const item = array[i]!
    if (array.indexOf(item, i + 1) !== -1) {
      duplicates.add(item)
    }
  }
  return [...duplicates]
}

function assertNoDuplicateFunctions(functions: MethodSignature[]): void {
  const duplicates = getDuplicates(functions.map((f) => f.getName()))
  for (const duplicate of duplicates) {
    const duplicateSignatures = functions
      .filter((f) => f.getName() === duplicate)
      .map((f) => `\`${f.getText()}\``)
    throw new Error(
      `Function overloading is not supported! (In ${duplicateSignatures.join(' vs ')})`
    )
  }
}

function createSharedCppSpec(module: InterfaceDeclaration): File[] {
  const moduleName = module.getSymbolOrThrow().getEscapedName()
  const cppClassName = `${moduleName}Spec`

  // Properties (getters + setters)
  const properties = module.getProperties()
  const cppProperties = properties.map((p) => new Property(p))

  // Functions
  const functions = module.getMethods()
  assertNoDuplicateFunctions(functions)
  const cppMethods = functions.map((f) => new Method(f))

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
 * An abstract base class for \`${moduleName}\` (${module.getSourceFile().getBaseName()})
 * Inherit this class to create instances of \`${cppClassName}\` in C++.
 * @example
 * \`\`\`cpp
 * class ${moduleName}: public ${cppClassName} {
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
    static constexpr auto TAG = "${moduleName}";

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
    language: 'c++',
    name: `${cppClassName}.hpp`,
  })
  files.push({
    content: cppBodyCode,
    language: 'c++',
    name: `${cppClassName}.cpp`,
  })
  files.push(...extraDefinitions)
  return files
}

function createAppleSwiftSpec(_module: InterfaceDeclaration): File[] {
  throw new Error(`Swift for Apple/iOS is not yet implemented!`)
}

function createAndroidKotlinSpec(_module: InterfaceDeclaration): File[] {
  throw new Error(`Kotlin for Android is not yet implemented!`)
}
