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

  get cases(): [string, Type][] {
    const labels = [
      'first',
      'second',
      'third',
      'fourth',
      'fifth',
      'sixth',
      'seventh',
      'eigth',
      'ninth',
    ]
    return this.variants.map((v, i) => {
      const label = labels[i]
      if (label == null)
        throw new Error(
          `Variant does not support ${this.variants.length} items!`
        )
      return [label, v]
    })
  }

  getCode(language: Language): string {
    const types = this.variants
      .map((v) => v.getCode(language))
      .filter(isNotDuplicate)

    switch (language) {
      case 'c++':
        return `std::variant<${types.join(', ')}>`
      case 'swift':
        return `Variant${types.length}<${types.join(', ')}>`
      case 'kotlin':
        return `Variant_${types.join('_')}`
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
