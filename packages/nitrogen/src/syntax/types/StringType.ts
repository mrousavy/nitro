import type { Language } from '../../getPlatformSpecs.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import type { Type, TypeKind } from './Type.js'

export class StringType implements Type {
  get canBePassedByReference(): boolean {
    // It's a string<..>, heavy to copy.
    return true
  }
  get kind(): TypeKind {
    return 'string'
  }
  get isEquatable(): boolean {
    return true
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return 'std::string'
      case 'swift':
        return 'String'
      case 'kotlin':
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

  getRequiredImports(language: Language): SourceImport[] {
    const imports: SourceImport[] = []
    if (language === 'c++') {
      imports.push({
        language: 'c++',
        name: 'string',
        space: 'system',
      })
    }
    return imports
  }
}
