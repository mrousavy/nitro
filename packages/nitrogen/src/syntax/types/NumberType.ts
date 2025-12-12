import type { Language } from '../../getPlatformSpecs.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import type { Type, TypeKind } from './Type.js'

export class NumberType implements Type {
  get canBePassedByReference(): boolean {
    // It's a primitive
    return false
  }
  get kind(): TypeKind {
    return 'number'
  }
  get isEquatable(): boolean {
    return true
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return 'double'
      case 'swift':
        return 'Double'
      case 'kotlin':
        return 'Double'
      default:
        throw new Error(
          `Language ${language} is not yet supported for NumberType!`
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
