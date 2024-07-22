import type { ParameterDeclaration } from 'ts-morph'
import type { CodeNode } from './CodeNode.js'
import { escapeCppName, toReferenceType } from './helpers.js'
import type { Language } from '../getPlatformSpecs.js'
import { type SourceFile, type SourceImport } from './SourceFile.js'
import type { NamedType, Type } from './types/Type.js'
import { createNamedType } from './createType.js'
import { NamedWrappingType } from './types/NamedWrappingType.js'

export class Parameter implements CodeNode {
  readonly type: NamedType

  constructor(name: string, type: Type)
  constructor(parameter: ParameterDeclaration)
  constructor(...args: [ParameterDeclaration] | [string, Type]) {
    if (typeof args[0] === 'string') {
      // constructor(...) #1
      if (args.length !== 2)
        throw new Error(`Missing arguments for new Parameter(...) overload #1!`)
      const [name, type] = args
      this.type = new NamedWrappingType(name, type)
    } else {
      // constructor(...) #2
      const [param] = args
      const name = param.getSymbolOrThrow().getEscapedName()
      const type = param.getTypeNodeOrThrow().getType()
      const isOptional =
        param.hasQuestionToken() || param.isOptional() || type.isNullable()
      this.type = createNamedType(name, param.getType(), isOptional)
    }
  }

  get name(): string {
    return this.type.name
  }

  getCode(language: Language): string {
    const cppName = escapeCppName(this.name)
    switch (language) {
      case 'c++':
        let cppType = this.type.getCode('c++')
        if (this.type.canBePassedByReference) {
          // T -> const T&
          cppType = toReferenceType(cppType)
        }
        return `${cppType} ${cppName}`
      case 'swift':
        return `${cppName}: ${this.type.getCode('swift')}`
      default:
        throw new Error(
          `Language ${language} is not yet supported for parameters!`
        )
    }
  }

  getExtraFiles(): SourceFile[] {
    return this.type.getExtraFiles()
  }

  getRequiredImports(): SourceImport[] {
    return this.type.getRequiredImports()
  }
}
