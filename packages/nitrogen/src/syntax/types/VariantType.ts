import type { Language } from '../../getPlatformSpecs.js'
import { isNotDuplicate } from '../helpers.js'
import { type SourceFile, type SourceImport } from '../SourceFile.js'
import type { Type, TypeKind } from './Type.js'

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

  getCode(language: Language): string {
    const types = this.variants
      .map((v) => v.getCode(language))
      .filter(isNotDuplicate)

    switch (language) {
      case 'c++':
        return `std::variant<${types.join(', ')}>`
      case 'swift':
      case 'kotlin':
        if (this.aliasName == null) {
          const variants = this.variants.map((v) => v.getCode(language))
          const typename = `Variant<${variants.join(', ')}>`
          throw new Error(
            `${typename} needs to have an alias typename to be representable in ${language}! ` +
              `Instead of \`val: ${variants.join(' | ')}\`, you must alias it first: \`export type MyVariant = ${variants.join(' | ')}\`, then use \`val: MyVariant\`.`
          )
        }
        return this.aliasName
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
