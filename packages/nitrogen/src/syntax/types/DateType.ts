import type { Language } from '../../getPlatformSpecs.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import type { Type, TypeKind } from './Type.js'

export class DateType implements Type {
  get canBePassedByReference(): boolean {
    // simple chrono value type
    return false
  }

  get kind(): TypeKind {
    return 'date'
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return 'std::chrono::system_clock::time_point'
      case 'swift':
        return 'Date'
      case 'kotlin':
        return 'Instant'
      default:
        throw new Error(
          `Language ${language} is not yet supported for DateType!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return []
  }
  getRequiredImports(): SourceImport[] {
    return [
      {
        name: 'chrono',
        language: 'c++',
        space: 'system',
      },
    ]
  }
}
