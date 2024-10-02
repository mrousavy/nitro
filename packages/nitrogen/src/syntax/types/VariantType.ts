import type { Language } from '../../getPlatformSpecs.js'
import { escapeCppName, isNotDuplicate } from '../helpers.js'
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

  getSpecializationName(language: 'swift' | 'kotlin'): string {
    const typeNames = this.variants
      .map((v) => escapeCppName(v.getCode(language)))
      .filter(isNotDuplicate)
    return `Variant_${typeNames.join('_')}`
  }

  getCode(language: Language): string {
    const types = this.variants
      .map((v) => v.getCode(language))
      .filter(isNotDuplicate)

    switch (language) {
      case 'c++':
        return `std::variant<${types.join(', ')}>`
      case 'swift':
        return this.getSpecializationName('swift')
      case 'kotlin':
        return this.getSpecializationName('kotlin')
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
