import type { Language } from '../../getPlatformSpecs.js'
import type { SourceFile } from '../SourceFile.js'
import type { Type } from './Type.js'

export class OptionalType implements Type {
  readonly wrappingType: Type

  constructor(wrappingType: Type) {
    this.wrappingType = wrappingType
  }

  get canBePassedByReference(): boolean {
    return true
  }

  getCode(language: Language): string {
    const wrapping = this.wrappingType.getCode(language)
    switch (language) {
      case 'c++':
        return `std::optional<${wrapping}>`
      default:
        throw new Error(
          `Language ${language} is not yet supported for OptionalType!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return this.wrappingType.getExtraFiles()
  }
}
