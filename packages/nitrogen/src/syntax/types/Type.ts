import type { Language } from '../../getPlatformSpecs.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'

export type TypeKind =
  | 'array-buffer'
  | 'array'
  | 'bigint'
  | 'boolean'
  | 'enum'
  | 'error'
  | 'function'
  | 'hybrid-object'
  | 'hybrid-object-base'
  | 'map'
  | 'null'
  | 'number'
  | 'optional'
  | 'promise'
  | 'record'
  | 'string'
  | 'struct'
  | 'tuple'
  | 'variant'
  | 'void'

/**
 * Represents a TypeScript Type that can be represented in a native language (C++, Swift, Kotlin)
 */
export interface Type {
  /**
   * Get whether this type can be passed by reference in C++ (`const T&` vs `T`)
   */
  readonly canBePassedByReference: boolean
  /**
   * Get the kind of the type.
   */
  readonly kind: TypeKind
  /**
   * Get the native code required to represent this type for the given language (C++, Swift, Kotlin).
   *
   * E.g. for a `number` type, this would return `'double'` in C++.
   */
  getCode(language: Language): string
  /**
   * Get all required extra files that need to be **created** for this type to properly work.
   *
   * E.g. for `type Gender = 'male' | 'female'`, the enum `Gender` needs to be created first (as a separate file).
   */
  getExtraFiles(): SourceFile[]
  /**
   * Get all required extra imports that need to be **imported** for this type to properly work.
   */
  getRequiredImports(): SourceImport[]
}

export interface NamedType extends Type {
  /**
   * Get the name of the value if it is a member or parameter.
   *
   * E.g. for a class member `double _something`, this returns `'_something'`.
   */
  readonly name: string
  /**
   * Get the name of the value escaped as a valid C++ variable name.
   *
   * E.g. for a class member `double some-value`, this returns `'some_value'`.
   */
  readonly escapedName: string
}
