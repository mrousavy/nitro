import type { Language } from '../../getPlatformSpecs.js'
import { type SourceFile, type SourceImport } from '../SourceFile.js'
import type { GetCodeOptions, Type, TypeKind } from './Type.js'

export class TupleType implements Type {
  readonly itemTypes: Type[]

  constructor(itemTypes: Type[]) {
    this.itemTypes = itemTypes
  }

  get canBePassedByReference(): boolean {
    // It's a tuple<..> - heavy to copy
    return true
  }

  get kind(): TypeKind {
    return 'tuple'
  }
  get isEquatable(): boolean {
    return this.itemTypes.every((t) => t.isEquatable)
  }

  getCode(language: Language, options?: GetCodeOptions): string {
    const types = this.itemTypes.map((t) => t.getCode(language, options))

    switch (language) {
      case 'c++':
        return `std::tuple<${types.join(', ')}>`
      case 'swift':
        throw new Error(
          `Tuple (${types.join(', ')}) is not yet supported in Swift due to a Swift bug! See https://github.com/swiftlang/swift/issues/75865`
        )
      default:
        throw new Error(
          `Language ${language} is not yet supported for TupleType!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return this.itemTypes.flatMap((t) => t.getExtraFiles())
  }
  getRequiredImports(language: Language): SourceImport[] {
    const imports = this.itemTypes.flatMap((t) =>
      t.getRequiredImports(language)
    )
    if (language === 'c++') {
      imports.push({
        language: 'c++',
        name: 'tuple',
        space: 'system',
      })
    }
    return imports
  }
}
