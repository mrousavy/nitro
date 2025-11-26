import type { Language } from '../../getPlatformSpecs.js'
import { type SourceFile, type SourceImport } from '../SourceFile.js'
import type { GetCodeOptions, Type, TypeKind } from './Type.js'

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
  get isEquatable(): boolean {
    return this.keyType.isEquatable && this.valueType.isEquatable
  }

  getCode(language: Language, options?: GetCodeOptions): string {
    const keyCode = this.keyType.getCode(language, options)
    const valueCode = this.valueType.getCode(language, options)

    switch (language) {
      case 'c++':
        return `std::unordered_map<${keyCode}, ${valueCode}>`
      case 'swift':
        return `Dictionary<${keyCode}, ${valueCode}>`
      case 'kotlin':
        return `Map<${keyCode}, ${valueCode}>`
      default:
        throw new Error(
          `Language ${language} is not yet supported for RecordType!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return [...this.keyType.getExtraFiles(), ...this.valueType.getExtraFiles()]
  }
  getRequiredImports(language: Language): SourceImport[] {
    const imports: SourceImport[] = [
      ...this.keyType.getRequiredImports(language),
      ...this.valueType.getRequiredImports(language),
    ]
    if (language === 'c++') {
      imports.push({
        language: 'c++',
        name: 'unordered_map',
        space: 'system',
      })
    }
    return imports
  }
}
