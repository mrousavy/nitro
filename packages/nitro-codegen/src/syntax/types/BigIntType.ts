import type { Language } from '../../getPlatformSpecs.js'
import type { SourceFile } from '../SourceFile.js'
import type { Type } from './Type.js'

export class BigIntType implements Type {
  get canBePassedByReference(): boolean {
    return false
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return 'int64_t'
      case 'swift':
        return 'Int64'
      default:
        throw new Error(
          `Language ${language} is not yet supported for BigIntType!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return []
  }
}
