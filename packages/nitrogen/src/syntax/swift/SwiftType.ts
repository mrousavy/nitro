import type { Language } from '../../getPlatformSpecs.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import { ArrayType } from '../types/ArrayType.js'
import { getTypeAs } from '../types/getTypeAs.js'
import { OptionalType } from '../types/OptionalType.js'
import type { Type, TypeKind } from '../types/Type.js'

export class SwiftType implements Type {
  private readonly wrappedType: Type

  constructor(type: Type) {
    this.wrappedType = type
  }

  get canBePassedByReference(): boolean {
    return this.wrappedType.canBePassedByReference
  }

  get kind(): TypeKind {
    return this.wrappedType.kind
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        switch (this.kind) {
          case 'string':
            return 'swift::String'
          case 'array': {
            const array = getTypeAs(this.wrappedType, ArrayType)
            const wrapped = new SwiftType(array.itemType)
            return `swift::Array<${wrapped.getCode(language)}>`
          }
          case 'optional': {
            const optional = getTypeAs(this.wrappedType, OptionalType)
            const wrapped = new SwiftType(optional.wrappingType)
            return `swift::Optional<${wrapped.getCode(language)}>`
          }
          default:
            return this.wrappedType.getCode(language)
        }
      case 'swift':
        return this.wrappedType.getCode(language)
      default:
        throw new Error(`Invalid language for SwiftType: ${language}`)
    }
  }

  getExtraFiles(): SourceFile[] {
    return this.wrappedType.getExtraFiles()
  }

  getRequiredImports(): SourceImport[] {
    return this.wrappedType.getRequiredImports()
  }
}
