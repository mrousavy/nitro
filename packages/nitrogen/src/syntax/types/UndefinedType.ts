import type { Language } from '../../getPlatformSpecs.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import type { Type, TypeKind } from './Type.js'

export class UndefinedType implements Type {
  get canBePassedByReference(): boolean {
    // It's a primitive.
    return false
  }
  get kind(): TypeKind {
    return 'undefined'
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return 'std::nullopt_t'
      default:
        throw new Error(
          `Language ${language} is not yet supported for UndefinedType!`
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
