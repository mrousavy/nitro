import type { Language } from '../../getPlatformSpecs.js'
import { isNotDuplicate } from '../helpers.js'
import { type SourceFile, type SourceImport } from '../SourceFile.js'
import type { Type, TypeKind } from './Type.js'

export class VariantType implements Type {
  readonly variants: Type[]

  constructor(variants: Type[]) {
    this.variants = variants
  }

  get canBePassedByReference(): boolean {
    // It's a variant<..> - heavy to copy
    return true
  }

  get kind(): TypeKind {
    return 'variant'
  }

  getCode(language: Language): string {
    const types = this.variants
      .map((v) => v.getCode(language))
      .filter(isNotDuplicate)

    switch (language) {
      case 'c++':
        return `std::variant<${types.join(', ')}>`
      case 'swift':
        return `Variant_${types.join('_')}`
      case 'kotlin':
        if (types.length < 2) {
          throw new Error(
            `In Kotlin, Variants must have at least two types! This variant only has ${types.length} types: ${types.join(', ')}`
          )
        }
        if (types.length > 9) {
          throw new Error(
            `In Kotlin, Variants can only have a maximum of 9 types! This variant has ${types.length} types: ${types.join(', ')}`
          )
        }
        return `Variant${types.length}<${types.join(', ')}>`
      default:
        throw new Error(
          `Language ${language} is not yet supported for VariantType!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return this.variants.flatMap((v) => v.getExtraFiles())
  }
  getRequiredImports(): SourceImport[] {
    return [
      {
        language: 'c++',
        name: 'variant',
        space: 'system',
      },
      ...this.variants.flatMap((v) => v.getRequiredImports()),
    ]
  }
}
