import type { Language } from '../../getPlatformSpecs.js'
import { escapeCppName, isNotDuplicate } from '../helpers.js'
import { type SourceFile, type SourceImport } from '../SourceFile.js'
import type { Type, TypeKind } from './Type.js'

export const VariantLabels = [
  'first',
  'second',
  'third',
  'fourth',
  'fifth',
  'sixth',
  'seventh',
  'eigth',
  'ninth',
  'tenth',
] as const
type VariantLabel = (typeof VariantLabels)[number]

export class VariantType implements Type {
  readonly variants: Type[]
  readonly aliasName?: string

  constructor(variants: Type[], aliasName?: string) {
    this.variants = variants
    this.aliasName = aliasName
  }

  get canBePassedByReference(): boolean {
    // It's a variant<..> - heavy to copy
    return true
  }

  get kind(): TypeKind {
    return 'variant'
  }

  get jsType(): string {
    return this.variants.map((v) => v.kind).join(' | ')
  }

  get cases(): [VariantLabel, Type][] {
    return this.variants.map((v, i) => {
      const label = VariantLabels[i]
      if (label == null)
        throw new Error(
          `Variant<...> (\`${this.jsType}\`) does not support ${i} cases!`
        )
      return [label, v]
    })
  }

  getAliasName(language: Language): string {
    if (this.aliasName == null) {
      const variants = this.variants.map((v) => v.getCode(language))
      return escapeCppName(`Variant_${variants.join('_')}`)
    }
    return this.aliasName
  }

  getCode(language: Language): string {
    const types = this.variants
      .map((v) => v.getCode(language))
      .filter(isNotDuplicate)

    switch (language) {
      case 'c++':
        return `std::variant<${types.join(', ')}>`
      case 'swift':
      case 'kotlin':
        return this.getAliasName(language)
      default:
        throw new Error(
          `Language ${language} is not yet supported for VariantType!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return this.variants.flatMap((v) => v.getExtraFiles())
  }
  getRequiredImports(language: Language): SourceImport[] {
    const imports = this.variants.flatMap((v) => v.getRequiredImports(language))
    if (language === 'c++') {
      imports.push({
        language: 'c++',
        name: 'variant',
        space: 'system',
      })
    }
    return imports
  }
}
