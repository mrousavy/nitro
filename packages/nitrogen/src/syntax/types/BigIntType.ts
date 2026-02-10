import type { Language } from '../../getPlatformSpecs.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import type { Type, TypeKind } from './Type.js'

export class BigIntType implements Type {
  private signed: boolean

  constructor(signed: boolean) {
    this.signed = signed
  }

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
    if (this.signed) {
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
    } else {
      switch (language) {
        case 'c++':
          return 'uint64_t'
        case 'swift':
          return 'UInt64'
        case 'kotlin':
          return 'ULong'
        default:
          throw new Error(
            `Language ${language} is not yet supported for BigIntType!`
          )
      }
    }
  }
  getExtraFiles(): SourceFile[] {
    return []
  }
  getRequiredImports(): SourceImport[] {
    return []
  }
}
