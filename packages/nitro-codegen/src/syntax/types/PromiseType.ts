import type { Language } from '../../getPlatformSpecs.js'
import { type SourceFile, type SourceImport } from '../SourceFile.js'
import type { ReferenceConvention, Type, TypeKind } from './Type.js'

export class PromiseType implements Type {
  readonly resultingType: Type

  constructor(resultingType: Type) {
    this.resultingType = resultingType
  }

  get convention(): ReferenceConvention {
    // It's a std::future - holding onto it might block deletion.
    return 'move'
  }
  get kind(): TypeKind {
    return 'promise'
  }

  getCode(language: Language): string {
    const resultingCode = this.resultingType.getCode(language)
    switch (language) {
      case 'c++':
        return `std::future<${resultingCode}>`
      case 'swift':
        // TODO: Implement Promise in Swift!
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
    return this.resultingType.getRequiredImports()
  }
}
