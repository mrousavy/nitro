import type { Language } from '../getPlatformSpecs.js'
import type { SourceFile, SourceImport } from './SourceFile.js'

export interface CodeNode {
  /**
   * Get the code of this code node (e.g. property, method) in the given language.
   */
  getCode(language: Language): string
  /**
   * Get all extra definition files this code node needs (e.g. extra type/struct declarations
   * for complex types), or `[]` if none are required (e.g. if this uses primitive types only)
   *
   * All files returned here must be created in the project.
   * To include them, see {@linkcode getRequiredImports | getRequiredImports()}
   */
  getExtraFiles(): SourceFile[]
  /**
   * Get all required imports this code node needs (e.g. extra type/struct declarations for complex types),
   * or `[]` if no imports are required (e.g. if this uses primitive types only).
   *
   * All imports returned here must be included in the current file (e.g. `#include "..."` or `import ...`)
   */
  getRequiredImports(): SourceImport[]
}
