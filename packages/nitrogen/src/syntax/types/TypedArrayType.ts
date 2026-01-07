import type { Language } from '../../getPlatformSpecs.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import type { Type, TypeKind } from './Type.js'

/**
 * Represents the element type of a TypedArray.
 */
export type TypedArrayElementType =
  | 'int8'
  | 'uint8'
  | 'int16'
  | 'uint16'
  | 'int32'
  | 'uint32'
  | 'float32'
  | 'float64'
  | 'bigint64'
  | 'biguint64'

/**
 * Maps TypeScript TypedArray names to their element types.
 */
export const TYPED_ARRAY_MAP: Record<string, TypedArrayElementType> = {
  Int8Array: 'int8',
  Uint8Array: 'uint8',
  Int16Array: 'int16',
  Uint16Array: 'uint16',
  Int32Array: 'int32',
  Uint32Array: 'uint32',
  Float32Array: 'float32',
  Float64Array: 'float64',
  BigInt64Array: 'bigint64',
  BigUint64Array: 'biguint64',
}

/**
 * Maps element types to C++ types.
 */
const CPP_TYPE_MAP: Record<TypedArrayElementType, string> = {
  int8: 'int8_t',
  uint8: 'uint8_t',
  int16: 'int16_t',
  uint16: 'uint16_t',
  int32: 'int32_t',
  uint32: 'uint32_t',
  float32: 'float',
  float64: 'double',
  bigint64: 'int64_t',
  biguint64: 'uint64_t',
}

/**
 * Maps element types to Swift types.
 */
const SWIFT_TYPE_MAP: Record<TypedArrayElementType, string> = {
  int8: 'Int8',
  uint8: 'UInt8',
  int16: 'Int16',
  uint16: 'UInt16',
  int32: 'Int32',
  uint32: 'UInt32',
  float32: 'Float',
  float64: 'Double',
  bigint64: 'Int64',
  biguint64: 'UInt64',
}

/**
 * Maps element types to Kotlin types.
 */
const KOTLIN_TYPE_MAP: Record<TypedArrayElementType, string> = {
  int8: 'Byte',
  uint8: 'UByte',
  int16: 'Short',
  uint16: 'UShort',
  int32: 'Int',
  uint32: 'UInt',
  float32: 'Float',
  float64: 'Double',
  bigint64: 'Long',
  biguint64: 'ULong',
}

export class TypedArrayType implements Type {
  readonly elementType: TypedArrayElementType

  constructor(elementType: TypedArrayElementType) {
    this.elementType = elementType
  }

  get canBePassedByReference(): boolean {
    // TypedArray is a value type that wraps a shared_ptr
    return true
  }

  get kind(): TypeKind {
    return 'typed-array' as TypeKind
  }

  get isEquatable(): boolean {
    return true
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return `TypedArray<${CPP_TYPE_MAP[this.elementType]}>`
      case 'swift':
        // For Swift, we'll use the C++ TypedArray via bridging
        return `TypedArray<${SWIFT_TYPE_MAP[this.elementType]}>`
      case 'kotlin':
        // For Kotlin, we'll use the C++ TypedArray via JNI
        return `TypedArray<${KOTLIN_TYPE_MAP[this.elementType]}>`
      default:
        throw new Error(
          `Language ${language} is not yet supported for TypedArrayType!`
        )
    }
  }

  getExtraFiles(): SourceFile[] {
    return []
  }

  getRequiredImports(language: Language): SourceImport[] {
    const imports: SourceImport[] = []
    switch (language) {
      case 'c++':
        imports.push({
          language: 'c++',
          name: 'NitroModules/TypedArray.hpp',
          space: 'system',
        })
        break
      case 'swift':
        imports.push({
          name: 'NitroModules',
          language: 'swift',
          space: 'system',
        })
        break
      case 'kotlin':
        imports.push({
          name: 'com.margelo.nitro.core.TypedArray',
          language: 'kotlin',
          space: 'system',
        })
        break
    }
    return imports
  }
}

