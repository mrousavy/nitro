import type { Language } from '../../getPlatformSpecs.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import type { ReferenceConvention, Type, TypeKind } from './Type.js'

export class BigIntType implements Type {
  get convention(): ReferenceConvention {
    // It's a primitive.
    return 'by-value'
  }

  get kind(): TypeKind {
    return 'bigint'
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return 'int64_t'
      case 'swift':
        return 'Int64'
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
