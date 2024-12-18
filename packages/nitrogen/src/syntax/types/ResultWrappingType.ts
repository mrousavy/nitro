import type { Language } from '../../getPlatformSpecs.js'
import { type SourceFile, type SourceImport } from '../SourceFile.js'
import { ErrorType } from './ErrorType.js'
import type { Type, TypeKind } from './Type.js'

export class ResultWrappingType implements Type {
  readonly result: Type
  readonly error: Type

  constructor(result: Type) {
    this.result = result
    this.error = new ErrorType()
  }

  get canBePassedByReference(): boolean {
    return this.result.canBePassedByReference
  }

  get kind(): TypeKind {
    return 'result-wrapper'
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return `Result<${this.result.getCode(language)}>`
      case 'swift':
        return this.result.getCode(language)
      default:
        throw new Error(
          `Language ${language} is not yet supported for VariantType!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return [...this.result.getExtraFiles(), ...this.error.getExtraFiles()]
  }
  getRequiredImports(): SourceImport[] {
    return [
      {
        language: 'c++',
        name: 'NitroModules/Result.hpp',
        space: 'system',
      },
      ...this.result.getRequiredImports(),
      ...this.error.getRequiredImports(),
    ]
  }
}
