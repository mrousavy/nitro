import type { Language } from '../../getPlatformSpecs.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import type { ReferenceConvention, Type, TypeKind } from './Type.js'

export class NumberType implements Type {
  get convention(): ReferenceConvention {
    // It's a primitive.
    return 'by-value'
  }
  get kind(): TypeKind {
    return 'number'
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return 'double'
      case 'swift':
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
