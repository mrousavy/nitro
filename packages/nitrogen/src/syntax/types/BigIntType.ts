import type { Language } from '../../getPlatformSpecs.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import type { Type, TypeKind } from './Type.js'

export class BigIntType implements Type {
  get canBePassedByReference(): boolean {
    // It's a primitive.
    return false
  }

  get kind(): TypeKind {
    return 'bigint'
  }
  get isEquatable(): boolean {
    return true
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return 'int64_t'
      case 'swift':
        return 'Int64'
      case 'kotlin':
        return 'Long'
      default:
        throw new Error(
          `Language ${language} is not yet supported for BigIntType!`
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
