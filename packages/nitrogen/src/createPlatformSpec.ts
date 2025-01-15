import { Node, Type } from 'ts-morph'
import type { SourceFile } from './syntax/SourceFile.js'
import { createCppHybridObject } from './syntax/c++/CppHybridObject.js'
import {
  extendsHybridObject,
  extendsHybridView,
  isAnyHybridSubclass,
  isDirectlyHybridObject,
  type Language,
} from './getPlatformSpecs.js'
import type { HybridObjectSpec } from './syntax/HybridObjectSpec.js'
import { Property } from './syntax/Property.js'
import { Method } from './syntax/Method.js'
import { createSwiftHybridObject } from './syntax/swift/SwiftHybridObject.js'
import { createKotlinHybridObject } from './syntax/kotlin/KotlinHybridObject.js'
import { createType } from './syntax/createType.js'
import { Parameter } from './syntax/Parameter.js'
import { getBaseTypes } from './utils.js'

export function generatePlatformFiles(
  interfaceType: Type,
  language: Language
): SourceFile[] {
  const spec = getHybridObjectSpec(interfaceType, language)

  // TODO: We currently just call this so the HybridObject itself is a "known type".
  // This causes the Swift Umbrella header to properly forward-declare it.
  // Without this, only Hybrid Objects that are actually used in public APIs will be forward-declared.
  createType(language, interfaceType, false)

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

    const parent = declaration.getParentOrThrow().getType()

    if (parent === type) {
      // it's an own property. declared literally here. fine.
    } else if (
      extendsHybridObject(parent, true) ||
      isDirectlyHybridObject(parent)
    ) {
      // it's coming from a base class that is already a HybridObject. We can grab this via inheritance.
      // don't generate this property natively.
      continue
    } else {
      // it's coming from any TypeScript type that is not a HybridObject.
      // Maybe just a literal interface, then we copy over the props.
    }

    if (Node.isPropertySignature(declaration)) {
      const t = declaration.getType()
      const propType = createType(
        language,
        t,
        prop.isOptional() || t.isNullable()
      )
      properties.push(
        new Property(prop.getName(), propType, declaration.isReadonly())
      )
    } else if (Node.isMethodSignature(declaration)) {
      const returnType = declaration.getReturnType()
      const methodReturnType = createType(
        language,
        returnType,
        returnType.isNullable()
      )
      const methodParameters = declaration
        .getParameters()
        .map((p) => new Parameter(p, language))
      methods.push(
        new Method(prop.getName(), methodReturnType, methodParameters)
      )
    } else {
      throw new Error(
        `${name}: Property "${prop.getName()}" is neither a property, nor a method!`
      )
    }
  }

  const bases = getBaseTypes(type)
    .filter((t) => isAnyHybridSubclass(t))
    .map((t) => getHybridObjectSpec(t, language))
  const isHybridView = extendsHybridView(type, true)

  const spec: HybridObjectSpec = {
    language: language,
    name: name,
    properties: properties,
    methods: methods,
    baseTypes: bases,
    isHybridView: isHybridView,
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
