import { type InterfaceDeclaration, type MethodSignature } from 'ts-morph'
import type { SourceFile } from './syntax/SourceFile.js'
import { createCppHybridObject } from './syntax/c++/CppHybridObject.js'
import type { Language } from './getPlatformSpecs.js'
import type { HybridObjectSpec } from './syntax/HybridObjectSpec.js'
import { Property } from './syntax/Property.js'
import { Method } from './syntax/Method.js'
import { createSwiftHybridObject } from './syntax/swift/SwiftHybridObject.js'
import { createKotlinHybridObject } from './syntax/kotlin/KotlinHybridObject.js'
import { createType } from './syntax/createType.js'

export function generatePlatformFiles(
  declaration: InterfaceDeclaration,
  language: Language
): SourceFile[] {
  const spec = getHybridObjectSpec(declaration, language)

  // TODO: We currently just call this so the HybridObject itself is a "known type".
  // This causes the Swift Umbrella header to properly forward-declare it.
  // Without this, only Hybrid Objects that are actually used in public APIs will be forward-declared.
  createType(declaration.getType(), false)

  switch (language) {
    case 'c++':
      return generateCppFiles(spec)
    case 'swift':
      return generateSwiftFiles(spec)
    case 'kotlin':
      return generateKotlinFiles(spec)
    default:
      throw new Error(`Language "${language}" is not supported!`)
  }
}

function getHybridObjectSpec(
  declaration: InterfaceDeclaration,
  language: Language
): HybridObjectSpec {
  const interfaceName = declaration.getSymbolOrThrow().getEscapedName()

  const properties = declaration.getProperties()
  const methods = declaration.getMethods()
  assertNoDuplicateFunctions(methods)
  const spec: HybridObjectSpec = {
    language: language,
    name: interfaceName,
    properties: properties.map((p) => new Property(p)),
    methods: methods.map((m) => new Method(m)),
  }
  return spec
}

function generateCppFiles(spec: HybridObjectSpec): SourceFile[] {
  const cppFiles = createCppHybridObject(spec)
  return cppFiles
}

function generateSwiftFiles(spec: HybridObjectSpec): SourceFile[] {
  // 1. Always generate a C++ spec for the shared layer and type declarations (enums, interfaces, ...)
  const cppFiles = generateCppFiles(spec)
  // 2. Generate Swift specific files and potentially a C++ binding layer
  const swiftFiles = createSwiftHybridObject(spec)
  return [...cppFiles, ...swiftFiles]
}

function generateKotlinFiles(spec: HybridObjectSpec): SourceFile[] {
  // 1. Always generate a C++ spec for the shared layer and type declarations (enums, interfaces, ...)
  const cppFiles = generateCppFiles(spec)
  // 2. Generate Kotlin specific files and potentially a C++ binding layer
  const kotlinFiles = createKotlinHybridObject(spec)
  return [...cppFiles, ...kotlinFiles]
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
