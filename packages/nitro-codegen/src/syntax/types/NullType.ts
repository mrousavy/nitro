import type { Language } from '../../getPlatformSpecs.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import type { ReferenceConvention, Type, TypeKind } from './Type.js'

export class NullType implements Type {
  get convention(): ReferenceConvention {
    // It's a primitive.
    return 'by-value'
  }
  get kind(): TypeKind {
    return 'null'
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return 'std::nullptr_t'
      default:
        throw new Error(
          `Language ${language} is not yet supported for NullType!`
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
