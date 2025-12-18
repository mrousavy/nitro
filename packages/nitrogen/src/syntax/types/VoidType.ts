import type { Language } from '../../getPlatformSpecs.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import type { Type, TypeKind } from './Type.js'

export class VoidType implements Type {
  get canBePassedByReference(): boolean {
    // It's void.
    return false
  }
  get kind(): TypeKind {
    return 'void'
  }
  get isEquatable(): boolean {
    return true
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return 'void'
      case 'swift':
        return 'Void'
      case 'kotlin':
        return 'Unit'
      default:
        throw new Error(
          `Language ${language} is not yet supported for VoidType!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return []
  }
  getRequiredImports(): SourceImport[] {
    return []
  }
}
