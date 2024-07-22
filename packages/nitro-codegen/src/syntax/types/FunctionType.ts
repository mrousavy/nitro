import type { Language } from '../../getPlatformSpecs.js'
import {
  createCppFunctionSpecialization,
  type FunctionSpecialization,
} from '../c++/CppFunctionSpecialization.js'
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

  getCode(language: Language): string {
    const specialization = this.specialization

    switch (language) {
      case 'c++':
        return specialization.typename
      case 'swift':
        return specialization.typename
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
