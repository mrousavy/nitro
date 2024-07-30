import type { Language } from '../../getPlatformSpecs.js'
import { type SourceFile, type SourceImport } from '../SourceFile.js'
import type { Type, TypeKind } from './Type.js'

export class VariantType implements Type {
  readonly variants: Type[]

  constructor(variants: Type[]) {
    this.variants = variants
  }

  get canBePassedByReference(): boolean {
    return true
  }

  get kind(): TypeKind {
    return 'variant'
  }

  getCode(language: Language): string {
    const types = this.variants.map((v) => v.getCode(language))

    switch (language) {
      case 'c++':
        return `std::variant<${types.join(', ')}>`
      default:
        throw new Error(
          `Language ${language} is not yet supported for ArrayType!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return this.variants.flatMap((v) => v.getExtraFiles())
  }
  getRequiredImports(): SourceImport[] {
    return this.variants.flatMap((v) => v.getRequiredImports())
  }
}
