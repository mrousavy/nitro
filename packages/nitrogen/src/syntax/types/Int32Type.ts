import type { Language } from '../../getPlatformSpecs.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import type { Type, TypeKind } from './Type.js'

export class Int32Type implements Type {
  get canBePassedByReference(): boolean {
    // It's a primitive
    return false
  }
  get kind(): TypeKind {
    return 'int32'
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return 'int32_t'
      case 'swift':
        return 'Int32'
      case 'kotlin':
        return 'Int'
      default:
        throw new Error(
          `Language ${language} is not yet supported for Int32Type!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return []
  }
  getRequiredImports(language: Language): SourceImport[] {
    if (language === 'c++') {
      return [
        {
          language: language,
          name: 'cstdint',
          space: 'system',
        },
      ]
    }
    return []
  }
}
