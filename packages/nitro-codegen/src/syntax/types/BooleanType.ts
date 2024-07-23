import type { Language } from '../../getPlatformSpecs.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import type { ReferenceConvention, Type, TypeKind } from './Type.js'

export class BooleanType implements Type {
  get convention(): ReferenceConvention {
    // It's a primitive.
    return 'by-value'
  }

  get kind(): TypeKind {
    return 'boolean'
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return 'bool'
      case 'swift':
        return 'Bool'
      default:
        throw new Error(
          `Language ${language} is not yet supported for BooleanType!`
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
