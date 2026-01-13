import type { Language } from '../../getPlatformSpecs.js'
import { type SourceFile, type SourceImport } from '../SourceFile.js'
import { ErrorType } from './ErrorType.js'
import type { GetCodeOptions, Type, TypeKind } from './Type.js'

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
  get isEquatable(): boolean {
    return this.result.isEquatable && this.error.isEquatable
  }

  getCode(language: Language, options?: GetCodeOptions): string {
    const type = this.result.getCode(language, options)
    switch (language) {
      case 'c++':
        return `Result<${type}>`
      case 'swift':
        return type
      default:
        throw new Error(
          `Language ${language} is not yet supported for VariantType!`
        )
    }
  }
  getExtraFiles(visited?: Set<Type>): SourceFile[] {
    return [...this.result.getExtraFiles(visited), ...this.error.getExtraFiles(visited)]
  }
  getRequiredImports(language: Language, visited?: Set<Type>): SourceImport[] {
    const imports: SourceImport[] = [
      ...this.result.getRequiredImports(language, visited),
      ...this.error.getRequiredImports(language, visited),
    ]
    if (language === 'c++') {
      imports.push({
        language: 'c++',
        name: 'NitroModules/Result.hpp',
        space: 'system',
      })
    }
    return imports
  }
}
