import type { Language } from '../../getPlatformSpecs.js'
import { escapeCppName, toReferenceType } from '../helpers.js'
import { type SourceFile, type SourceImport } from '../SourceFile.js'
import { PromiseType } from './PromiseType.js'
import type { NamedType, Type, TypeKind } from './Type.js'

export class FunctionType implements Type {
  readonly returnType: Type
  readonly parameters: NamedType[]

  constructor(returnType: Type, parameters: NamedType[]) {
    this.returnType = returnType
    this.parameters = parameters
  }

  get specializationName(): string {
    return (
      'Callback_' +
      [this.returnType, ...this.parameters]
        .map((p) => escapeCppName(p.getCode('c++')))
        .join('_')
    )
  }

  get jsName(): string {
    const paramsJs = this.parameters
      .map((p) => `${p.name}: ${p.kind}`)
      .join(', ')
    const returnType = this.returnType.getCode('c++')
    return `(${paramsJs}) => ${returnType}`
  }

  get canBePassedByReference(): boolean {
    // It's a function<..>, heavy to copy.
    return true
  }

  get kind(): TypeKind {
    return 'function'
  }

  get asyncReturnType(): Type {
    return this.returnType.kind === 'void'
      ? this.returnType
      : new PromiseType(this.returnType)
  }

  getCppFunctionPointerType(name: string, includeNameInfo = true): string {
    const params = this.parameters
      .map((p) => {
        const type = p.getCode('c++')
        const code = p.canBePassedByReference ? toReferenceType(type) : type
        if (includeNameInfo) return `${code} /* ${p.name} */`
        else return code
      })
      .join(', ')
    const returnType = this.returnType.getCode('c++')
    return `${returnType}(*${name})(${params})`
  }

  getCode(language: Language, includeNameInfo = true): string {
    switch (language) {
      case 'c++': {
        const params = this.parameters
          .map((p) => {
            const type = p.getCode('c++')
            const code = p.canBePassedByReference ? toReferenceType(type) : type
            if (includeNameInfo) return `${code} /* ${p.name} */`
            else return code
          })
          .join(', ')
        const returnType = this.returnType.getCode(language)
        return `Callback<${returnType}(${params})>`
      }
      case 'swift': {
        const params = this.parameters
          .map((p) => {
            if (includeNameInfo)
              return `_ ${p.escapedName}: ${p.getCode(language)}`
            else return p.getCode(language)
          })
          .join(', ')
        const returnTypeCode = this.asyncReturnType.getCode(language)
        return `((${params}) -> ${returnTypeCode})`
      }
      case 'kotlin': {
        const params = this.parameters
          .map((p) => {
            if (includeNameInfo)
              return `${p.escapedName}: ${p.getCode(language)}`
            else return p.getCode(language)
          })
          .join(', ')
        const returnTypeCode = this.asyncReturnType.getCode(language)
        return `(${params}) -> ${returnTypeCode}`
      }
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
  getRequiredImports(): SourceImport[] {
    return [
      {
        language: 'c++',
        name: 'NitroModules/Callback.hpp',
        space: 'system',
      },
      ...this.returnType.getRequiredImports(),
      ...this.parameters.flatMap((p) => p.getRequiredImports()),
    ]
  }
}
