import type { Language } from '../../getPlatformSpecs.js'
import type { SourceFile } from '../SourceFile.js'
import type { Type, TypeKind } from './Type.js'

export class FunctionType implements Type {
  readonly returnType: Type
  readonly parameters: Type[]

  constructor(returnType: Type, parameters: Type[]) {
    this.returnType = returnType
    this.parameters = parameters
  }

  get canBePassedByReference(): boolean {
    return true
  }

  get kind(): TypeKind {
    return 'function'
  }

  getCode(language: Language): string {
    const returnCode = this.returnType.getCode(language)
    const parametersCode = this.parameters.map((p) => p.getCode(language))

    switch (language) {
      case 'c++':
        return `std::function<${returnCode}(${parametersCode.join(', ')})>`
      default:
        throw new Error(
          `Language ${language} is not yet supported for FunctionType!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return [
      ...this.returnType.getExtraFiles(),
      ...this.parameters.flatMap((p) => p.getExtraFiles()),
    ]
  }
}
