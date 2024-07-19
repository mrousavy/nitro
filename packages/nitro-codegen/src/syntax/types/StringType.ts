import type { Language } from '../../getPlatformSpecs.js'
import type { SourceFile } from '../SourceFile.js'
import type { Type } from './Type.js'

export class StringType implements Type {
  get canBePassedByReference(): boolean {
    return true
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return 'std::string'
      default:
        throw new Error(
          `Language ${language} is not yet supported for StringType!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return []
  }
}
