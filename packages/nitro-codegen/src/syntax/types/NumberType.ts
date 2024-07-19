import type { Language } from '../../getPlatformSpecs.js'
import type { SourceFile } from '../SourceFile.js'
import type { Type } from './Type.js'

export class NumberType implements Type {
  get canBePassedByReference(): boolean {
    return false
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return 'double'
      default:
        throw new Error(
          `Language ${language} is not yet supported for NumberType!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return []
  }
}
