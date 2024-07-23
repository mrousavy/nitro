import type { Language } from '../../getPlatformSpecs.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import type { ReferenceConvention, Type, TypeKind } from './Type.js'

export class VoidType implements Type {
  get convention(): ReferenceConvention {
    // It's a primitive
    return 'by-value'
  }
  get kind(): TypeKind {
    return 'void'
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
