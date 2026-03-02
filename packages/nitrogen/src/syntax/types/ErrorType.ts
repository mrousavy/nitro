import type { Language } from '../../getPlatformSpecs.js'
import { type SourceFile, type SourceImport } from '../SourceFile.js'
import type { Type, TypeKind } from './Type.js'

export class ErrorType implements Type {
  constructor() {}

  get canBePassedByReference(): boolean {
    // It's an exception<..>, pass by reference.
    return true
  }
  get kind(): TypeKind {
    return 'error'
  }
  get isEquatable(): boolean {
    return true
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return `std::exception_ptr`
      case 'swift':
        return `Error`
      case 'kotlin':
        return `Throwable`
      case 'rust':
        return `String`
      default:
        throw new Error(
          `Language ${language} is not yet supported for ThrowableType!`
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
        name: 'exception',
        space: 'system',
      })
    }
    return imports
  }
}
