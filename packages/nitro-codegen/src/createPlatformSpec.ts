import { type InterfaceDeclaration, type MethodSignature } from 'ts-morph'
import type { SourceFile } from './syntax/SourceFile.js'
import { createCppHybridObject } from './syntax/c++/CppHybridObject.js'
import type { Language } from './getPlatformSpecs.js'

export function createPlatformSpec(
  module: InterfaceDeclaration,
  language: Language
): SourceFile[] {
  switch (language) {
    case 'c++':
      return createCppSpec(module)
    case 'swift':
      return createSwiftSpec(module)
    case 'kotlin':
      return createKotlinSpec(module)
    default:
      throw new Error(`Language "${language}" is not supported!`)
  }
}

function createCppSpec(module: InterfaceDeclaration): SourceFile[] {
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

function createSwiftSpec(_module: InterfaceDeclaration): SourceFile[] {
  throw new Error(`Swift Specs are not yet implemented!`)
}

function createKotlinSpec(_module: InterfaceDeclaration): SourceFile[] {
  throw new Error(`Kotlin Specs are not yet implemented!`)
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
