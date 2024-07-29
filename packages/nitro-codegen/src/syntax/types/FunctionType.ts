import type { Language } from '../../getPlatformSpecs.js'
import { getAndroidPackage, getCxxNamespace } from '../../options.js'
import {
  createCppFunctionSpecialization,
  type FunctionSpecialization,
} from '../c++/CppFunctionSpecialization.js'
import { Parameter } from '../Parameter.js'
import { type SourceFile, type SourceImport } from '../SourceFile.js'
import type { NamedType, Type, TypeKind } from './Type.js'

export class FunctionType implements Type {
  readonly returnType: Type
  readonly parameters: NamedType[]

  constructor(returnType: Type, parameters: NamedType[]) {
    this.returnType = returnType
    this.parameters = parameters
  }

  get canBePassedByReference(): boolean {
    return true
  }

  get kind(): TypeKind {
    return 'function'
  }

  get specialization(): FunctionSpecialization {
    return createCppFunctionSpecialization(this)
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
    const specialization = this.specialization

    switch (language) {
      case 'c++':
        return specialization.typename
      case 'swift':
        return getCxxNamespace('swift', specialization.typename)
      case 'kotlin':
        return getAndroidPackage('java/kotlin', specialization.typename)
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
      this.specialization.declarationFile,
      ...this.returnType.getRequiredImports(),
      ...this.parameters.flatMap((p) => p.getRequiredImports()),
    ]
  }
}
