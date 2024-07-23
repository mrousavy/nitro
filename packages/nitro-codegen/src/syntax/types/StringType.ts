import type { Language } from '../../getPlatformSpecs.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import type { ReferenceConvention, Type, TypeKind } from './Type.js'

export class StringType implements Type {
  get convention(): ReferenceConvention {
    // It's a std::string
    return 'by-reference'
  }
  get kind(): TypeKind {
    return 'string'
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return 'std::string'
      case 'swift':
        return 'String'
      default:
        throw new Error(
          `Language ${language} is not yet supported for StringType!`
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
