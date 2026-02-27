import type { Language } from '../../getPlatformSpecs.js'
import { type SourceFile, type SourceImport } from '../SourceFile.js'
import type { GetCodeOptions, Type, TypeKind } from './Type.js'

export class OptionalType implements Type {
  readonly wrappingType: Type

  constructor(wrappingType: Type) {
    this.wrappingType = wrappingType
  }

  get canBePassedByReference(): boolean {
    // depends whether the wrapping type is heavy to copy or not.
    return this.wrappingType.canBePassedByReference
  }
  get kind(): TypeKind {
    return 'optional'
  }
  get isEquatable(): boolean {
    return this.wrappingType.isEquatable
  }
  get needsBraces(): boolean {
    switch (this.wrappingType.kind) {
      case 'function':
        return true
      default:
        return false
    }
  }

  getCode(language: Language, options?: GetCodeOptions): string {
    const wrapping = this.wrappingType.getCode(language, options)
    switch (language) {
      case 'c++':
        return `std::optional<${wrapping}>`
      case 'swift':
        if (this.needsBraces) {
          return `(${wrapping})?`
        } else {
          return `${wrapping}?`
        }
      case 'kotlin':
        if (this.needsBraces) {
          return `(${wrapping})?`
        } else {
          return `${wrapping}?`
        }
      case 'rust':
        return `Option<${wrapping}>`
      default:
        throw new Error(
          `Language ${language} is not yet supported for OptionalType!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return this.wrappingType.getExtraFiles()
  }
  getRequiredImports(language: Language): SourceImport[] {
    const imports: SourceImport[] =
      this.wrappingType.getRequiredImports(language)
    if (language === 'c++') {
      imports.push({
        language: 'c++',
        name: 'optional',
        space: 'system',
      })
    }
    return imports
  }
}
