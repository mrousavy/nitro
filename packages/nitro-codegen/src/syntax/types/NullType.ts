import type { Language } from '../../getPlatformSpecs.js'
import type { SourceFile } from '../SourceFile.js'
import type { Type } from './Type.js'

export class NullType implements Type {
  get canBePassedByReference(): boolean {
    return false
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
}
