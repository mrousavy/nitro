import type { Language } from '../../getPlatformSpecs.js'
import { type SourceFile, type SourceImport } from '../SourceFile.js'
import type { Type, TypeKind } from './Type.js'

export class RecordType implements Type {
  readonly keyType: Type
  readonly valueType: Type

  constructor(keyType: Type, valueType: Type) {
    this.keyType = keyType
    this.valueType = valueType
  }

  get canBePassedByReference(): boolean {
    // It's a unordered_map<..>, heavy to copy.
    return true
  }
  get kind(): TypeKind {
    return 'record'
  }

  getCode(language: Language): string {
    const keyCode = this.keyType.getCode(language)
    const valueCode = this.valueType.getCode(language)

    switch (language) {
      case 'c++':
        return `std::unordered_map<${keyCode}, ${valueCode}>`
      case 'swift':
        return `Dictionary<${keyCode}, ${valueCode}>`
      case 'kotlin':
        return `HashMap<${keyCode}, ${valueCode}>`
      default:
        throw new Error(
          `Language ${language} is not yet supported for RecordType!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return [...this.keyType.getExtraFiles(), ...this.valueType.getExtraFiles()]
  }
  getRequiredImports(): SourceImport[] {
    return [
      {
        language: 'c++',
        name: 'unordered_map',
        space: 'system',
      },
      ...this.keyType.getRequiredImports(),
      ...this.valueType.getRequiredImports(),
    ]
  }
}
