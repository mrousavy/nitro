import type { Language } from '../../getPlatformSpecs.js'
import {
  createCppFunctionSpecialization,
  type FunctionSpecialization,
} from '../c++/CppFunctionSpecialization.js'
import { Parameter } from '../Parameter.js'
import { type SourceFile, type SourceImport } from '../SourceFile.js'
import { PromiseType } from './PromiseType.js'
import type { NamedType, Type, TypeKind } from './Type.js'

export class FunctionType implements Type {
  readonly returnType: Type
  readonly parameters: NamedType[]
  readonly specialization: FunctionSpecialization

  constructor(returnType: Type, parameters: NamedType[]) {
    if (returnType.kind === 'void') {
      // void callbacks are async, but we don't care about the result.
      this.returnType = returnType
    } else {
      // non-void callbacks are async and need to be awaited to get the result from JS.
      this.returnType = new PromiseType(returnType)
    }
    this.parameters = parameters
    this.specialization = createCppFunctionSpecialization(
      this.returnType,
      this.parameters
    )
  }

  get canBePassedByReference(): boolean {
    // It's a function<..>, heavy to copy.
    return true
  }

  get specializationName(): string {
    return this.specialization.typename
  }

  get kind(): TypeKind {
    return 'function'
  }

  /**
   * For a function, get the forward recreation of it:
   * If variable is called `func`, this would return:
   * ```cpp
   * [func = std::move(func)](Params... params) -> ReturnType {
   *   return func(params...);
   * }
   * ```
   */
  getForwardRecreationCode(variableName: string, language: Language): string {
    const returnType = this.returnType.getCode(language)
    const parameters = this.parameters
      .map((p) => new Parameter(p.name, p))
      .map((p) => p.getCode('c++'))
    const forwardedParameters = this.parameters.map(
      (p) => `std::forward<decltype(${p.name})>(${p.name})`
    )

    switch (language) {
      case 'c++':
        const closure = `[${variableName} = std::move(${variableName})]`
        const signature = `(${parameters.join(', ')}) -> ${returnType}`
        const body = `{ return ${variableName}(${forwardedParameters.join(', ')}); }`
        return `${closure} ${signature} ${body}`
      default:
        throw new Error(
          `Language ${language} is not yet supported for function forward recreations!`
        )
    }
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++': {
        return this.specialization.typename
      }
      case 'swift': {
        const params = this.parameters
          .map((p) => `_ ${p.escapedName}: ${p.getCode(language)}`)
          .join(', ')
        const returnType = this.returnType.getCode(language)
        return `(@escaping (${params}) -> ${returnType})`
      }
      case 'kotlin':
        const params = this.parameters
          .map((p) => `${p.escapedName}: ${p.getCode(language)}`)
          .join(', ')
        const returnType = this.returnType.getCode(language)
        return `((${params}) -> ${returnType})`
      default:
        throw new Error(
          `Language ${language} is not yet supported for FunctionType!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    const specialization = this.specialization
    return [
      specialization.declarationFile,
      ...this.returnType.getExtraFiles(),
      ...this.parameters.flatMap((p) => p.getExtraFiles()),
    ]
  }
  getRequiredImports(): SourceImport[] {
    return [
      {
        language: 'c++',
        name: this.specialization.declarationFile.name,
        forwardDeclaration: undefined,
        space: 'user',
      },
      ...this.returnType.getRequiredImports(),
      ...this.parameters.flatMap((p) => p.getRequiredImports()),
    ]
  }
}
