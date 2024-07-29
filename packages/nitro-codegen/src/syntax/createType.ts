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
  if (typeArguments.length !== count) {
    throw new Error(
      `Type ${type} looks like a ${typename}, but has ${typeArguments.length} type arguments instead of ${count}!`
    )
  }
  return typeArguments as Tuple<TSMorphType<ts.Type>, N>
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
  } else if (type.isArray() || type.isTuple()) {
    const arrayElementType = type.getArrayElementTypeOrThrow()
    const elementType = createType(arrayElementType, false)
    return new ArrayType(elementType)
  } else if (type.getCallSignatures().length > 0) {
    // It's a function!
    const callSignature = getFunctionCallSignature(type)
    const funcReturnType = callSignature.getReturnType()
    const returnType = createType(funcReturnType, false)
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
  } else if (type.isEnum()) {
    // It is an enum. We need to generate a C++ declaration for the enum
    const typename = type.getSymbolOrThrow().getEscapedName()
    const declaration = type.getSymbolOrThrow().getValueDeclarationOrThrow()
    const enumDeclaration = declaration.asKindOrThrow(
      ts.SyntaxKind.EnumDeclaration
    )
    return new EnumType(typename, enumDeclaration)
  } else if (type.isUnion()) {
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
