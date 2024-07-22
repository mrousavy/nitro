import type { Language, Platform } from '../getPlatformSpecs.js'
import type { NamedType } from './types/Type.js'

/**
 * Represents a file with source code, in a specific programming language.
 */
export interface SourceFile {
  /**
   * The name of the file with extension (e.g. `Image.hpp`)
   */
  name: string
  /**
   * The full content of the file.
   */
  content: string
  /**
   * The language the {@linkcode content} is written in (e.g. `c++`)
   */
  language: Language
  /**
   * The platform this file can be used on or is created for. (e.g. `ios`)
   */
  platform: Platform | 'shared'
}

/**
 * Represents a {@linkcode SourceFile} that also references other types.
 */
export interface FileWithReferencedTypes extends SourceFile {
  /**
   * All external types this {@linkcode SourceFile} references,
   * either as return types, parameter types, or member types.
   */
  referencedTypes: NamedType[]
}

/**
 * Represents an import for a specific header or module.
 *
 * E.g. `include "Image.hpp"`, or `import NitroModules`
 */
export interface SourceImport {
  /**
   * The name of the header or module to import (e.g. `Image.hpp`)
   */
  name: string
  /**
   * If this is a C++ import, it could also be forward-declared.
   * @example
   * ```cpp
   * namespace NitroImage {
   *   class HybridImage;
   * }
   * ```
   */
  forwardDeclaration?: string
  /**
   * The language this file is written in (e.g. `c++`)
   */
  language: Language
}

export function getSourceFileImport(file: SourceFile): SourceImport {
  return {
    name: file.name,
    language: file.language,
  }
}
