import {
  ts,
  Type as TSMorphType,
  type Project,
  type Signature,
  type TypeAliasDeclaration,
} from 'ts-morph'
import type { Type } from './types/Type.js'
import { BooleanType } from './types/BooleanType.js'
import { NumberType } from './types/NumberType.js'
import { StringType } from './types/StringType.js'
import { Int64Type } from './types/Int64Type.js'
import { VoidType } from './types/VoidType.js'
import { ArrayType } from './types/ArrayType.js'
import { FunctionType } from './types/FunctionType.js'
import { PromiseType } from './types/PromiseType.js'
import { RecordType } from './types/RecordType.js'
import { ArrayBufferType } from './types/ArrayBufferType.js'
import { EnumType } from './types/EnumType.js'
import { HybridObjectType } from './types/HybridObjectType.js'
import { StructType } from './types/StructType.js'
import { OptionalType } from './types/OptionalType.js'
import { NamedWrappingType } from './types/NamedWrappingType.js'
import { getInterfaceProperties } from './getInterfaceProperties.js'
import { VariantType } from './types/VariantType.js'
import { MapType } from './types/MapType.js'
import { TupleType } from './types/TupleType.js'
import {
  isAnyHybridSubclass,
  isDirectlyAnyHybridObject,
  isHybridView,
  type Language,
} from '../getPlatformSpecs.js'
import { AnyHybridObjectType } from './types/AnyHybridObjectType.js'
import { ErrorType } from './types/ErrorType.js'
import { getBaseTypes, getHybridObjectNitroModuleConfig } from '../utils.js'
import { DateType } from './types/DateType.js'
import { NitroConfig } from '../config/NitroConfig.js'
import { CustomType } from './types/CustomType.js'
import {
  isSyncFunction,
  isArrayBuffer,
  isCustomType,
  isDate,
  isError,
  isMap,
  isPromise,
  isRecord,
  isInt64,
  isUInt64,
} from './isCoreType.js'
import { getCustomTypeConfig } from './getCustomTypeConfig.js'
import { compareLooselyness } from './helpers.js'
import { NullType } from './types/NullType.js'
import { UInt64Type } from './types/UInt64Type.js'

// Cache of type alias name -> TypeAliasDeclarations for efficient lookups during enum reconstruction.
// Multiple declarations may exist for the same name across different files.
let typeAliasCache: Map<string, TypeAliasDeclaration[]> | undefined

/**
 * Initialize the type creation context with the ts-morph Project.
 * Must be called before createType() to enable enum reconstruction from flattened unions.
 */
export function initializeTypeCreation(project: Project): void {
  // Build type alias cache for efficient lookups
  typeAliasCache = new Map()
  for (const sf of project.getSourceFiles()) {
    for (const ta of sf.getTypeAliases()) {
      const name = ta.getName()
      const existing = typeAliasCache.get(name) ?? []
      existing.push(ta)
      typeAliasCache.set(name, existing)
    }
  }
}

function getHybridObjectName(type: TSMorphType): string {
  const symbol = isHybridView(type) ? type.getAliasSymbol() : type.getSymbol()
  if (symbol == null) {
    throw new Error(
      `Cannot get name of \`${type.getText()}\` - symbol not found!`
    )
  }
  return symbol.getEscapedName()
}

function getFunctionCallSignature(func: TSMorphType): Signature {
  const callSignatures = func.getCallSignatures()
  const callSignature = callSignatures[0]
  if (callSignatures.length !== 1 || callSignature == null) {
    throw new Error(
      `Function overloads are not supported in Nitrogen! (in ${func.getText()})`
    )
  }
  return callSignature
}

function removeDuplicates(types: Type[]): Type[] {
  return types.filter((t1, index, array) => {
    const firstIndexOfType = array.findIndex(
      (t2) => t1.getCode('c++') === t2.getCode('c++')
    )
    return firstIndexOfType === index
  })
}

/**
 * When TypeScript flattens a union like `boolean | FooBar` into `boolean | 'foo' | 'bar'`,
 * we lose the information that 'foo' and 'bar' came from the named type `FooBar`.
 * This function reconstructs enum types by parsing the type text for named types
 * and matching their values against the string literals in the union.
 */
function reconstructEnumTypesFromStringLiterals(
  _type: TSMorphType,
  stringLiterals: TSMorphType[]
): { enumTypes: EnumType[]; uncoveredLiterals: TSMorphType[] } {
  const stringLiteralValues = new Set(stringLiterals.map((t) => t.getText()))
  const coveredLiterals = new Set<string>()
  const enumTypes: EnumType[] = []

  if (typeAliasCache == null) {
    throw new Error(
      'initializeTypeCreation() must be called before processing types with string literal unions'
    )
  }

  // Collect all candidate enums whose values are all present in our string literals
  const candidateEnums: { name: string; enumType: EnumType; values: Set<string> }[] = []

  for (const typeAliases of typeAliasCache.values()) {
    for (const typeAlias of typeAliases) {
      const aliasType = typeAlias.getType()
      if (!aliasType.isUnion() || !aliasType.getAliasSymbol()) continue

      const aliasUnionTypes = aliasType.getUnionTypes()
      const isStringLiteralEnum = aliasUnionTypes.every((t) =>
        t.isStringLiteral()
      )
      if (!isStringLiteralEnum) continue

      const enumValues = aliasUnionTypes.map((t) => t.getText())
      const allValuesPresent = enumValues.every((v) =>
        stringLiteralValues.has(v)
      )
      if (!allValuesPresent) continue

      candidateEnums.push({
        name: typeAlias.getName(),
        enumType: new EnumType(typeAlias.getName(), aliasType),
        values: new Set(enumValues),
      })
    }
  }

  // Check for overlapping enums - if any two candidate enums share a value, it's ambiguous
  for (let i = 0; i < candidateEnums.length; i++) {
    for (let j = i + 1; j < candidateEnums.length; j++) {
      const enumA = candidateEnums[i]!
      const enumB = candidateEnums[j]!
      for (const value of enumA.values) {
        if (enumB.values.has(value)) {
          throw new Error(
            `Cannot create variant with overlapping string enum types: ${enumA.name} and ${enumB.name} both contain ${value}. Use enums with distinct values.`
          )
        }
      }
    }
  }

  // No overlaps - add all candidate enums
  for (const candidate of candidateEnums) {
    enumTypes.push(candidate.enumType)
    candidate.values.forEach((v) => coveredLiterals.add(v))
  }

  const uncoveredLiterals = stringLiterals.filter(
    (t) => !coveredLiterals.has(t.getText())
  )
  return { enumTypes, uncoveredLiterals }
}

type Tuple<
  T,
  N extends number,
  R extends unknown[] = [],
> = R['length'] extends N ? R : Tuple<T, N, [T, ...R]>
function getArguments<N extends number>(
  type: TSMorphType,
  typename: string,
  count: N
): Tuple<TSMorphType<ts.Type>, N> {
  const typeArguments = type.getTypeArguments()
  if (typeArguments.length === count) {
    return typeArguments as Tuple<TSMorphType<ts.Type>, N>
  }

  const aliasTypeArguments = type.getAliasTypeArguments()
  if (aliasTypeArguments.length === count) {
    return aliasTypeArguments as Tuple<TSMorphType<ts.Type>, N>
  }

  throw new Error(
    `Type ${type.getText()} looks like a ${typename}, but has ${typeArguments.length} or ${aliasTypeArguments.length} type arguments instead of ${count}!`
  )
}

export function createNamedType(
  language: Language,
  name: string,
  type: TSMorphType,
  isOptional: boolean
) {
  if (name.startsWith('__')) {
    throw new Error(
      `Name cannot start with two underscores (__) as this is reserved syntax for Nitrogen! (In ${type.getText()})`
    )
  }
  return new NamedWrappingType(name, createType(language, type, isOptional))
}

export function createVoidType(): Type {
  return new VoidType()
}

// Caches complex types (types that have a symbol)
type TypeId = string
const knownTypes: Record<Language, Map<TypeId, Type>> = {
  'c++': new Map<TypeId, Type>(),
  'swift': new Map<TypeId, Type>(),
  'kotlin': new Map<TypeId, Type>(),
}

/**
 * Get a list of all currently known complex types.
 */
export function getAllKnownTypes(language?: Language): Type[] {
  if (language != null) {
    // Get types for the given language
    return Array.from(knownTypes[language].values())
  } else {
    // Get types for all languages alltogether
    const allMaps = Object.values(knownTypes)
    return allMaps.flatMap((m) => Array.from(m.values()))
  }
}

function getTypeId(type: TSMorphType, isOptional: boolean): string {
  const symbol = type.getSymbol()
  let key = type.getText()
  if (symbol != null) {
    key += '_' + symbol.getFullyQualifiedName()
  }
  if (isOptional) key += '?'
  return key
}

export function addKnownType(
  key: string,
  type: Type,
  language: Language
): void {
  if (knownTypes[language].has(key)) {
    // type is already known
    return
  }
  knownTypes[language].set(key, type)
}

/**
 * Create a new type (or return it from cache if it is already known)
 */
export function createType(
  language: Language,
  type: TSMorphType,
  isOptional: boolean
): Type {
  const key = getTypeId(type, isOptional)
  if (key != null && knownTypes[language].has(key)) {
    const known = knownTypes[language].get(key)!
    if (isOptional === known instanceof OptionalType) {
      return known
    }
  }

  const get = () => {
    if (isOptional) {
      const wrapping = createType(language, type, false)
      return new OptionalType(wrapping)
    }

    if (type.isNull()) {
      return new NullType()
    } else if (type.isBoolean() || type.isBooleanLiteral()) {
      return new BooleanType()
    } else if (type.isNumber() || type.isNumberLiteral()) {
      if (type.isEnumLiteral()) {
        // An enum is just a number, that's why it's a number literal.
        // Get the base of the literal, which would be our enum's definition.
        const baseType = type.getBaseTypeOfLiteralType()
        if (!baseType.isEnum()) {
          // The base of the literal is not the enum definition, we need to throw.
          throw new Error(
            `The enum "${type.getLiteralValue()}" (${type.getText()}) is either a single-value-enum, or an enum-literal. Use a separately defined enum with at least 2 cases instead!`
          )
        }
        // Call createType(...) now with the enum type.
        return createType(language, baseType, isOptional)
      }
      return new NumberType()
    } else if (type.isString()) {
      return new StringType()
    } else if (isInt64(type)) {
      return new Int64Type()
    } else if (isUInt64(type)) {
      return new UInt64Type()
    } else if (type.isVoid()) {
      return new VoidType()
    } else if (type.isArray()) {
      const arrayElementType = type.getArrayElementTypeOrThrow()
      const elementType = createType(language, arrayElementType, false)
      return new ArrayType(elementType)
    } else if (type.isTuple()) {
      const itemTypes = type
        .getTupleElements()
        .map((t) => createType(language, t, t.isNullable()))
      return new TupleType(itemTypes)
    } else if (type.getCallSignatures().length > 0) {
      // It's a function!
      const callSignature = getFunctionCallSignature(type)
      const funcReturnType = callSignature.getReturnType()
      const isReturnOptional = funcReturnType
        .getUnionTypes()
        .some((t) => t.isUndefined())
      const returnType = createType(language, funcReturnType, isReturnOptional)
      const parameters = callSignature.getParameters().map((p) => {
        const declaration = p.getValueDeclarationOrThrow()
        const parameterType = p.getTypeAtLocation(declaration)
        const isNullable = parameterType.isNullable() || p.isOptional()
        return createNamedType(language, p.getName(), parameterType, isNullable)
      })
      const isSync = isSyncFunction(type)
      return new FunctionType(returnType, parameters, isSync)
    } else if (isPromise(type)) {
      // It's a Promise!
      const [promiseResolvingType] = getArguments(type, 'Promise', 1)
      const isResolvingOptional = promiseResolvingType
        .getUnionTypes()
        .some((t) => t.isUndefined())
      const resolvingType = createType(
        language,
        promiseResolvingType,
        isResolvingOptional
      )
      return new PromiseType(resolvingType)
    } else if (isRecord(type)) {
      // Record<K, V> -> unordered_map<K, V>
      const [keyTypeT, valueTypeT] = getArguments(type, 'Record', 2)
      const keyType = createType(language, keyTypeT, false)
      const valueType = createType(language, valueTypeT, false)
      return new RecordType(keyType, valueType)
    } else if (isArrayBuffer(type)) {
      // ArrayBuffer
      return new ArrayBufferType()
    } else if (isMap(type)) {
      // Map
      return new MapType()
    } else if (isDate(type)) {
      // Date
      return new DateType()
    } else if (isError(type)) {
      // Error
      return new ErrorType()
    } else if (isCustomType(type)) {
      // Custom C++ type (manually written)
      const { name, config } = getCustomTypeConfig(type)
      return new CustomType(name, config)
    } else if (type.isEnum()) {
      // It is an enum. We need to generate a C++ declaration for the enum
      const typename = type.getSymbolOrThrow().getEscapedName()
      const declaration = type.getSymbolOrThrow().getValueDeclarationOrThrow()
      const enumDeclaration = declaration.asKindOrThrow(
        ts.SyntaxKind.EnumDeclaration
      )
      return new EnumType(typename, enumDeclaration)
    } else if (type.isUnion()) {
      // It is some kind of union;
      // - of string literals (then it's an enum)
      // - of type `T | undefined` (then it's just optional `T`)
      // - of different types (then it's a variant `A | B | C`)
      const types = type.getUnionTypes()
      const nonNullTypes = types.filter(
        (t) => !t.isNull() && !t.isUndefined() && !t.isVoid()
      )
      const isEnumUnion = nonNullTypes.every((t) => t.isStringLiteral())
      if (isEnumUnion) {
        // It consists only of string literals - that means it's describing an enum!
        const symbol = type.getNonNullableType().getAliasSymbol()
        if (symbol == null) {
          // No alias symbol - could be multiple enum types flattened together (e.g., SomeEnum | SomeOtherEnum)
          // Try to reconstruct the original enum types from the string literals
          const { enumTypes, uncoveredLiterals } =
            reconstructEnumTypesFromStringLiterals(type, nonNullTypes)

          if (enumTypes.length === 0 || uncoveredLiterals.length > 0) {
            // Could not reconstruct enums - it's an inline union
            throw new Error(
              `Inline union types ("${type.getText()}") are not supported by Nitrogen!\n` +
                `Extract the union to a separate type, and re-run nitrogen!`
            )
          }

          if (enumTypes.length === 1) {
            // Single enum reconstructed
            return enumTypes[0]!
          }

          // Multiple enums - return as variant
          const name = type.getAliasSymbol()?.getName()
          return new VariantType(enumTypes, name)
        }
        const typename = symbol.getEscapedName()
        return new EnumType(typename, type)
      } else {
        // It consists of different types - that means it's a variant!
        const unionTypes = type
          .getUnionTypes()
          // Filter out any undefineds/voids, as those are already treated as `isOptional`.
          .filter((t) => !t.isUndefined() && !t.isVoid())

        // Separate string literals from other types
        // String literals might belong to a named enum type that got flattened
        const stringLiterals = unionTypes.filter((t) => t.isStringLiteral())
        const otherTypes = unionTypes.filter((t) => !t.isStringLiteral())

        let variants: Type[] = []

        // Process non-string-literal types
        for (const t of otherTypes) {
          variants.push(createType(language, t, false))
        }

        // For string literals, try to find named enum types from the original type text.
        // TypeScript flattens `boolean | FooBar` into `boolean | 'foo' | 'bar'`, losing the
        // enum type info. We reconstruct it by parsing the type text for named types.
        if (stringLiterals.length > 0) {
          const { enumTypes, uncoveredLiterals } =
            reconstructEnumTypesFromStringLiterals(type, stringLiterals)
          variants.push(...enumTypes)

          if (uncoveredLiterals.length > 0) {
            throw new Error(
              `String literal ${uncoveredLiterals[0]!.getText()} cannot be represented in C++ because it is ambiguous between a string and a discriminating union enum.`
            )
          }
        }

        variants = variants.toSorted(compareLooselyness)
        variants = removeDuplicates(variants)

        if (variants.length === 1) {
          // It's just one type with undefined/null variant(s) - so we treat it like a simple optional.
          return variants[0]!
        }

        const name = type.getAliasSymbol()?.getName()
        return new VariantType(variants, name)
      }
    } else if (isDirectlyAnyHybridObject(type)) {
      // It is a HybridObject directly/literally. Base type
      return new AnyHybridObjectType()
    } else if (isAnyHybridSubclass(type)) {
      // It is another HybridObject being referenced!
      const typename = getHybridObjectName(type)
      const baseTypes = getBaseTypes(type)
        .filter((t) => isAnyHybridSubclass(t))
        .map((b) => createType(language, b, false))
      const baseHybrids = baseTypes.filter((b) => b instanceof HybridObjectType)
      const sourceConfig =
        getHybridObjectNitroModuleConfig(type) ?? NitroConfig.current
      return new HybridObjectType(typename, language, baseHybrids, sourceConfig)
    } else if (type.isInterface()) {
      // It is an `interface T { ... }`, which is a `struct`
      const symbol = type.getAliasSymbol() ?? type.getSymbol()
      if (symbol == null)
        throw new Error(`Interface "${type.getText()}" does not have a Symbol!`)
      const typename = symbol.getName()
      const properties = getInterfaceProperties(language, type)
      return new StructType(typename, properties)
    } else if (type.isObject()) {
      // It is an object. If it has a symbol/name, it is a `type T = ...` declaration, so a `struct`.
      // Otherwise, it is an anonymous/inline object, which cannot be represented in native.
      const symbol = type.getAliasSymbol()
      if (symbol != null) {
        // it has a `type T = ...` declaration
        const typename = symbol.getName()
        const properties = getInterfaceProperties(language, type)
        return new StructType(typename, properties)
      } else {
        // It's an anonymous object (`{ ... }`)
        throw new Error(
          `Anonymous objects cannot be represented in C++! Extract "${type.getText()}" to a separate interface/type declaration.`
        )
      }
    } else if (type.isStringLiteral()) {
      throw new Error(
        `String literal ${type.getText()} cannot be represented in C++ because it is ambiguous between a string and a discriminating union enum.`
      )
    } else if (type.isUndefined()) {
      throw new Error(
        `The TypeScript type "undefined" cannot be represented in Nitro.\n` +
          `- If you want to make a type optional, add \`?\` to its name, or make it an union with \`undefined\`.\n` +
          `- If you want a method that returns nothing, use \`void\` instead.\n` +
          `- If you want to represent an explicit absence of a value, use \`null\` instead.`
      )
    } else if (type.isAny()) {
      throw new Error(
        `The TypeScript type "${type.getText()}" resolved to any - any is not supported in Nitro.`
      )
    } else if (type.isBigInt()) {
      throw new Error(
        `Using a bigint without specifying signedness is deprecated! Use \`Int64\` or \`UInt64\` instead.`
      )
    } else if (type.isLiteral()) {
      throw new Error(
        `The literal "${type.getLiteralValue()}" cannot be used as a type!`
      )
    } else {
      if (type.getSymbol() == null) {
        // There is no declaration for it!
        // Could be an invalid import, e.g. an alias
        throw new Error(
          `The TypeScript type "${type.getText()}" cannot be resolved - is it imported properly? ` +
            `Make sure to import it properly using fully specified relative or absolute imports, no aliases.`
        )
      } else {
        // A different error
        throw new Error(
          `The TypeScript type "${type.getText()}" cannot be represented in C++!`
        )
      }
    }
  }

  const result = get()
  if (key != null) {
    knownTypes[language].set(key, result)
  }
  return result
}
