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
  get isEquatable(): boolean {
    return true
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return 'std::chrono::system_clock::time_point'
      case 'swift':
        return 'Date'
      case 'kotlin':
        return 'java.time.Instant'
      case 'rust':
        return 'f64'
      default:
        throw new Error(
          `Language ${language} is not yet supported for DateType!`
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
        name: 'chrono',
        language: 'c++',
        space: 'system',
      })
    }
    return imports
  }
}
