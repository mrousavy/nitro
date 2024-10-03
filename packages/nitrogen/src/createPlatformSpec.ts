import { Node, Type } from 'ts-morph'
import type { SourceFile } from './syntax/SourceFile.js'
import { createCppHybridObject } from './syntax/c++/CppHybridObject.js'
import { type Language } from './getPlatformSpecs.js'
import type { HybridObjectSpec } from './syntax/HybridObjectSpec.js'
import { Property } from './syntax/Property.js'
import { Method } from './syntax/Method.js'
import { createSwiftHybridObject } from './syntax/swift/SwiftHybridObject.js'
import { createKotlinHybridObject } from './syntax/kotlin/KotlinHybridObject.js'
import { createType } from './syntax/createType.js'
import { Parameter } from './syntax/Parameter.js'

export function generatePlatformFiles(
  interfaceType: Type,
  language: Language
): SourceFile[] {
  const spec = getHybridObjectSpec(interfaceType, language)

  // TODO: We currently just call this so the HybridObject itself is a "known type".
  // This causes the Swift Umbrella header to properly forward-declare it.
  // Without this, only Hybrid Objects that are actually used in public APIs will be forward-declared.
  createType(interfaceType, false)

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

function getHybridObjectSpec(type: Type, language: Language): HybridObjectSpec {
  const symbol = type.getSymbolOrThrow()
  const name = symbol.getEscapedName()

  const properties: Property[] = []
  const methods: Method[] = []
  for (const prop of type.getProperties()) {
    const declarations = prop.getDeclarations()
    if (declarations.length > 1) {
      throw new Error(
        `${name}: Function overloading is not supported! (In "${prop.getName()}")`
      )
    }
    let declaration = declarations[0]
    if (declaration == null) {
      throw new Error(
        `${name}: Property "${prop.getName()}" does not have a type declaration!`
      )
    }

    const isOwnProperty = declaration.getParent()?.getType() === type
    if (!isOwnProperty) {
      // skip properties that are inherited by the parent (e.g. HybridObject.dispose())
      continue
    }

    if (Node.isPropertySignature(declaration)) {
      const t = declaration.getType()
      const propType = createType(t, prop.isOptional() || t.isNullable())
      properties.push(
        new Property(prop.getName(), propType, declaration.isReadonly())
      )
    } else if (Node.isMethodSignature(declaration)) {
      const returnType = declaration.getReturnType()
      const methodReturnType = createType(returnType, returnType.isNullable())
      const methodParameters = declaration
        .getParameters()
        .map((p) => new Parameter(p))
      methods.push(
        new Method(prop.getName(), methodReturnType, methodParameters)
      )
    } else {
      throw new Error(
        `${name}: Property "${prop.getName()}" is neither a property, nor a method!`
      )
    }
  }
  const spec: HybridObjectSpec = {
    language: language,
    name: name,
    properties: properties,
    methods: methods,
    // baseTypes: findHybridObjectBases(declaration.getType()),
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
