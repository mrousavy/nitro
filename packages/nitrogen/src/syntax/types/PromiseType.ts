import type { Language } from '../../getPlatformSpecs.js'
import { type SourceFile, type SourceImport } from '../SourceFile.js'
import type { Type, TypeKind } from './Type.js'

export class PromiseType implements Type {
  readonly resultingType: Type

  constructor(resultingType: Type) {
    this.resultingType = resultingType
  }

  get canBePassedByReference(): boolean {
    // It's a future<..>, it cannot be copied.
    return true
  }
  get kind(): TypeKind {
    return 'promise'
  }

  getCode(language: Language): string {
    const resultingCode = this.resultingType.getCode(language)
    switch (language) {
      case 'c++':
        return `std::shared_ptr<Promise<${resultingCode}>>`
      case 'swift':
        return `Promise<${resultingCode}>`
      case 'kotlin':
        return `Promise<${resultingCode}>`
      default:
        throw new Error(
          `Language ${language} is not yet supported for PromiseType!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return this.resultingType.getExtraFiles()
  }
  getRequiredImports(): SourceImport[] {
    return [
      {
        language: 'c++',
        name: 'NitroModules/Promise.hpp',
        space: 'system',
      },
      ...this.resultingType.getRequiredImports(),
    ]
  }
}
