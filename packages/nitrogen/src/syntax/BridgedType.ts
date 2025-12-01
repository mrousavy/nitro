import type { Language } from '../getPlatformSpecs.js'
import type { SourceFile, SourceImport } from './SourceFile.js'
import type { Type } from './types/Type.js'

export interface BridgedType<
  FromLanguage extends Language,
  ToLanguage extends Language,
> {
  /**
   * The underlying type that is being bridged between {@linkcode FromLanguage} and {@linkcode ToLanguage}
   */
  readonly type: Type
  /**
   * Whether the underlying type has a valid type (is not void or null)
   */
  readonly hasType: boolean
  /**
   * Whether this type can be passed by reference
   */
  readonly canBePassedByReference: boolean
  /**
   * Whether this bridged type needs special handling, or can just be used as-is
   */
  readonly needsSpecialHandling: boolean

  /**
   * Get all imports required for this bridge to work
   */
  getRequiredImports(language: Language, visited?: Set<Type>): SourceImport[]

  /**
   * Get all extra files that need to be created for this type, as well as the bridge.
   */
  getExtraFiles(visited?: Set<Type>): SourceFile[]

  /**
   * Get the code for the type itself in the given language
   */
  getTypeCode(language: FromLanguage | ToLanguage): string

  /**
   * Parse the given parameter from the source language to the given target language, in the given language.
   * For example, to convert an ArrayBuffer from Swift ({@linkcode from}) to C++ ({@linkcode to}) we
   * have to wrap it in an ArrayBufferHolder in Swift ({@linkcode inLanguage}), and unwrap
   * it from the ArrayBufferHolder again in C++ ({@linkcode inLanguage})
   */
  parse(
    parameterName: string,
    from: FromLanguage,
    to: ToLanguage,
    inLanguage: FromLanguage | ToLanguage
  ): string
  parse(
    parameterName: string,
    from: ToLanguage,
    to: FromLanguage,
    inLanguage: FromLanguage | ToLanguage
  ): string
}
