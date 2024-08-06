import { ts, type Signature, type Type as TSMorphType } from 'ts-morph'
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
  name: string,
  type: TSMorphType,
  isOptional: boolean
) {
  return new NamedWrappingType(name, createType(type, isOptional))
}

export function createVoidType(): Type {
  return new VoidType()
}

export function createType(type: TSMorphType, isOptional: boolean): Type {
  if (isOptional) {
    const wrapping = createType(type, false)
    return new OptionalType(wrapping)
  }

  if (type.isNull() || type.isUndefined()) {
    return new NullType()
  } else if (type.isBoolean() || type.isBooleanLiteral()) {
    return new BooleanType()
  } else if (type.isNumber() || type.isNumberLiteral()) {
    return new NumberType()
  } else if (type.isString()) {
    return new StringType()
  } else if (type.isBigInt() || type.isBigIntLiteral()) {
    return new BigIntType()
  } else if (type.isVoid()) {
    return new VoidType()
  } else if (type.isArray()) {
    const arrayElementType = type.getArrayElementTypeOrThrow()
    const elementType = createType(arrayElementType, false)
    return new ArrayType(elementType)
  } else if (type.isTuple()) {
    const itemTypes = type
      .getTupleElements()
      .map((t) => createType(t, t.isNullable()))
    return new TupleType(itemTypes)
  } else if (type.getCallSignatures().length > 0) {
    // It's a function!
    const callSignature = getFunctionCallSignature(type)
    const funcReturnType = callSignature.getReturnType()
    const returnType = createType(funcReturnType, funcReturnType.isNullable())
    const parameters = callSignature.getParameters().map((p) => {
      const declaration = p.getValueDeclarationOrThrow()
      const parameterType = p.getTypeAtLocation(declaration)
      return createNamedType(p.getName(), parameterType, p.isOptional())
    })
    return new FunctionType(returnType, parameters)
  } else if (isPromise(type)) {
    // It's a Promise!
    const [promiseResolvingType] = getArguments(type, 'Promise', 1)
    const resolvingType = createType(promiseResolvingType, false)
    return new PromiseType(resolvingType)
  } else if (isRecord(type)) {
    // Record<K, V> -> unordered_map<K, V>
    const [keyTypeT, valueTypeT] = getArguments(type, 'Record', 2)
    const keyType = createType(keyTypeT, false)
    const valueType = createType(valueTypeT, false)
    return new RecordType(keyType, valueType)
  } else if (isArrayBuffer(type)) {
    // ArrayBuffer
    return new ArrayBufferType()
  } else if (isMap(type)) {
    // Map
    return new MapType()
  } else if (type.isEnum()) {
    // It is an enum. We need to generate a C++ declaration for the enum
    const typename = type.getSymbolOrThrow().getEscapedName()
    const declaration = type.getSymbolOrThrow().getValueDeclarationOrThrow()
    const enumDeclaration = declaration.asKindOrThrow(
      ts.SyntaxKind.EnumDeclaration
    )
    return new EnumType(typename, enumDeclaration)
  } else if (type.isUnion()) {
    // It is some kind of union - either full of strings (then it's an enum, or different types, then it's a Variant)
    const isEnumUnion = type.getUnionTypes().every((t) => t.isStringLiteral())
    if (isEnumUnion) {
      // It consists only of string literaly - that means it's describing an enum!
      const symbol = type.getAliasSymbol()
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
        .map((t) => createType(t, false))
      variants = removeDuplicates(variants)

      if (variants.length === 1) {
        // It's just one type with undefined/null varians - so we treat it like a simple optional.
        return variants[0]!
      }

      return new VariantType(variants)
    }
  } else if (type.isInterface()) {
    // It references another interface/type, either a simple struct, or another HybridObject
    const typename = type.getSymbolOrThrow().getEscapedName()

    const isHybridObject = type
      .getBaseTypes()
      .some((t) => t.getText().includes('HybridObject'))
    if (isHybridObject) {
      // It is another HybridObject being referenced!
      return new HybridObjectType(typename)
    } else {
      // It is a simple struct being referenced.
      const properties = getInterfaceProperties(type)
      return new StructType(typename, properties)
    }
  } else if (type.isObject()) {
    throw new Error(
      `Anonymous objects cannot be represented in C++! Extract "${type.getText()}" to a separate interface/type declaration.`
    )
  } else if (type.isStringLiteral()) {
    throw new Error(
      `String literal ${type.getText()} cannot be represented in C++ because it is ambiguous between a string and a discriminating union enum.`
    )
  } else {
    throw new Error(
      `The TypeScript type "${type.getText()}" cannot be represented in C++!`
    )
  }
}
