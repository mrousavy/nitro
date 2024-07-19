import type { Language } from '../../getPlatformSpecs.js'
import type { SourceFile } from '../SourceFile.js'
import type { Type } from './Type.js'

export class ArrayBufferType implements Type {
  get canBePassedByReference(): boolean {
    return false
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return 'std::shared_ptr<ArrayBuffer>'
      default:
        throw new Error(
          `Language ${language} is not yet supported for ArrayBufferType!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return []
  }
}
