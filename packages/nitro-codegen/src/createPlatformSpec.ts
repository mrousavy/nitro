import type { PlatformSpec } from 'react-native-nitro-modules'
import type { Platform } from './getPlatformSpecs.js'
import { type InterfaceDeclaration, type MethodSignature } from 'ts-morph'
import type { File } from './syntax/File.js'
import { createCppHybridObject } from './syntax/c++/CppHybridObject.js'

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
  const interfaceName = module.getSymbolOrThrow().getEscapedName()

  const properties = module.getProperties()
  const methods = module.getMethods()
  assertNoDuplicateFunctions(methods)

  const cppFiles = createCppHybridObject(
    interfaceName,
    module.getSourceFile().getBaseName(),
    properties,
    methods
  )
  return cppFiles
}

function createAppleSwiftSpec(_module: InterfaceDeclaration): File[] {
  throw new Error(`Swift for Apple/iOS is not yet implemented!`)
}

function createAndroidKotlinSpec(_module: InterfaceDeclaration): File[] {
  throw new Error(`Kotlin for Android is not yet implemented!`)
}
