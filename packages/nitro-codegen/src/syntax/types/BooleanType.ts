import type { Language } from '../../getPlatformSpecs.js'
import type { SourceFile } from '../SourceFile.js'
import type { Type, TypeKind } from './Type.js'

export class BooleanType implements Type {
  get canBePassedByReference(): boolean {
    return false
  }

  get kind(): TypeKind {
    return 'boolean'
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return 'bool'
      case 'swift':
        return 'Bool'
      default:
        throw new Error(
          `Language ${language} is not yet supported for BooleanType!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return []
  }
}
