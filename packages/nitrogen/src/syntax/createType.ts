import { ts, Type as TSMorphType, type Signature } from 'ts-morph'
import type { Type } from './types/Type.js'
import { NullType } from './types/NullType.js'
import { BooleanType } from './types/BooleanType.js'
import { NumberType } from './types/NumberType.js'
import { StringType } from './types/StringType.js'
import { BigIntType } from './types/BigIntType.js'
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
  isDirectlyHybridObject,
  isHybridView,
  type Language,
} from '../getPlatformSpecs.js'
import { HybridObjectBaseType } from './types/HybridObjectBaseType.js'
import { ErrorType } from './types/ErrorType.js'
import { getBaseTypes } from '../utils.js'

function isSymbol(type: TSMorphType, symbolName: string): boolean {
  const symbol = type.getSymbol()
  if (symbol?.getName() === symbolName) {
    return true
  }
  const aliasSymbol = type.getAliasSymbol()
  if (aliasSymbol?.getName() === symbolName) {
    return true
  }
  return false
}

function isPromise(type: TSMorphType): boolean {
  return isSymbol(type, 'Promise')
}

function isRecord(type: TSMorphType): boolean {
  return isSymbol(type, 'Record')
}

function isArrayBuffer(type: TSMorphType): boolean {
  return isSymbol(type, 'ArrayBuffer')
}

function isMap(type: TSMorphType): boolean {
  return isSymbol(type, 'AnyMap')
}

function isError(type: TSMorphType): boolean {
  return isSymbol(type, 'Error')
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
  const aliasTypeArguments = type.getAliasTypeArguments()

  if (typeArguments.length === count) {
    return typeArguments as Tuple<TSMorphType<ts.Type>, N>
  }
  if (aliasTypeArguments.length === count) {
    return aliasTypeArguments as Tuple<TSMorphType<ts.Type>, N>
  }
  throw new Error(
    `Type ${type.getText()} looks like a ${typename}, but has ${typeArguments.length} type arguments instead of ${count}!`
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

function isSyncFunction(type: TSMorphType): boolean {
  if (type.getCallSignatures().length < 1)
    // not a function.
    return false
  const syncTag = type.getProperty('__syncTag')
  return syncTag != null
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

    if (type.isNull() || type.isUndefined()) {
      return new NullType()
    } else if (type.isBoolean() || type.isBooleanLiteral()) {
      return new BooleanType()
    } else if (type.isNumber() || type.isNumberLiteral()) {
      if (type.isEnumLiteral()) {
        // enum literals are technically just numbers - but we treat them differently in C++.
        return createType(language, type.getBaseTypeOfLiteralType(), isOptional)
      }
      return new NumberType()
    } else if (type.isString()) {
      return new StringType()
    } else if (type.isBigInt() || type.isBigIntLiteral()) {
      return new BigIntType()
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
      const returnType = createType(
        language,
        funcReturnType,
        funcReturnType.isNullable()
      )
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
      const resolvingType = createType(
        language,
        promiseResolvingType,
        promiseResolvingType.isNullable()
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
    } else if (isError(type)) {
      // Error
      return new ErrorType()
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
        // It consists only of string literaly - that means it's describing an enum!
        const symbol = type.getNonNullableType().getAliasSymbol()
        if (symbol == null) {
          // If there is no alias, it is an inline union instead of a separate type declaration!
          throw new Error(
            `Inline union types ("${type.getText()}") are not supported by Nitrogen!\n` +
              `Extract the union to a separate type, and re-run nitrogen!`
          )
        }
        const typename = symbol.getEscapedName()
        return new EnumType(typename, type)
      } else {
        // It consists of different types - that means it's a variant!
        let variants = type
          .getUnionTypes()
          // Filter out any nulls or undefineds, as those are already treated as `isOptional`.
          .filter((t) => !t.isNull() && !t.isUndefined() && !t.isVoid())
          .map((t) => createType(language, t, false))
        variants = removeDuplicates(variants)

        if (variants.length === 1) {
          // It's just one type with undefined/null variant(s) - so we treat it like a simple optional.
          return variants[0]!
        }

        return new VariantType(variants)
      }
    } else if (isAnyHybridSubclass(type)) {
      // It is another HybridObject being referenced!
      const typename = getHybridObjectName(type)
      const baseTypes = getBaseTypes(type)
        .filter((t) => isAnyHybridSubclass(t))
        .map((b) => createType(language, b, false))
      const baseHybrids = baseTypes.filter((b) => b instanceof HybridObjectType)
      return new HybridObjectType(typename, language, baseHybrids)
    } else if (isDirectlyHybridObject(type)) {
      // It is a HybridObject directly/literally. Base type
      return new HybridObjectBaseType()
    } else if (type.isInterface()) {
      // It is an `interface T { ... }`, which is a `struct`
      const typename = type.getSymbolOrThrow().getName()
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
