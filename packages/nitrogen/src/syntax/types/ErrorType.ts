import type { Language } from '../../getPlatformSpecs.js'
import { type SourceFile, type SourceImport } from '../SourceFile.js'
import type { Type, TypeKind } from './Type.js'

export class ErrorType implements Type {
  constructor() {}

  get canBePassedByReference(): boolean {
    // It's a exception<..>, pass by reference.
    return true
  }
  get kind(): TypeKind {
    return 'error'
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return `std::exception`
      case 'swift':
        return `std.exception`
      case 'kotlin':
        return `Throwable`
      default:
        throw new Error(
          `Language ${language} is not yet supported for ThrowableType!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return []
  }
  getRequiredImports(): SourceImport[] {
    return [
      {
        language: 'c++',
        name: 'exception',
        space: 'system',
      },
    ]
  }
}
