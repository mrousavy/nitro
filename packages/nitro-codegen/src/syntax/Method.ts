import type { CodeNode } from './CodeNode.js'
import { removeDuplicates } from './helpers.js'
import type { Language } from '../getPlatformSpecs.js'
import type { SourceFile } from './SourceFile.js'
import { Parameter } from './Parameter.js'
import type { MethodSignature } from 'ts-morph'
import type { Type } from './types/Type.js'
import { createType } from './createType.js'

export type MethodBody = string

export class Method implements CodeNode {
  readonly name: string
  readonly returnType: Type
  readonly parameters: Parameter[]

  constructor(name: string, returnType: Type, parameters: Parameter[])
  constructor(prop: MethodSignature)
  constructor(...args: [MethodSignature] | [string, Type, Parameter[]]) {
    if (typeof args[0] === 'string') {
      // constructor(...) #1
      if (args.length !== 3)
        throw new Error(`Missing arguments for new Method(...) overload #1!`)
      const [name, returnType, parameters] = args
      this.name = name
      this.returnType = returnType
      this.parameters = parameters
    } else {
      // constructor(...) #2
      const [prop] = args
      this.name = prop.getSymbolOrThrow().getEscapedName()
      const returnType = prop.getReturnType()
      const isOptional = returnType.isNullable()
      this.returnType = createType(returnType, isOptional)
      this.parameters = prop.getParameters().map((p) => new Parameter(p))
    }
  }

  getCode(language: Language, body?: MethodBody): string {
    switch (language) {
      case 'c++': {
        const returnType = this.returnType.getCode('c++')
        const params = this.parameters.map((p) => p.getCode('c++'))
        if (body == null) {
          return `virtual ${returnType} ${this.name}(${params.join(', ')}) = 0;`
        } else {
          return `
${returnType} ${this.name}(${params.join(', ')}) {
  ${body}
}
`.trim()
        }
      }
      case 'swift': {
        const params = this.parameters.map((p) => p.getCode('swift'))
        const returnType = this.returnType.getCode('swift')
        if (body == null) {
          return `func ${this.name}(${params.join(', ')}) throws -> ${returnType}`
        } else {
          return `
func ${this.name}(${params.join(', ')}) throws -> ${returnType} {
  ${body}
}
`.trim()
        }
      }
      default:
        throw new Error(
          `Language ${language} is not yet supported for property getters!`
        )
    }
  }

  getDefinitionFiles(): SourceFile[] {
    const parametersDefinitionFiles = this.parameters.flatMap((p) =>
      p.getDefinitionFiles()
    )
    const returnTypeDefinitionFiles = this.returnType.getExtraFiles()
    const allFiles = [
      ...returnTypeDefinitionFiles,
      ...parametersDefinitionFiles,
    ]
    return removeDuplicates(allFiles, (a, b) => a.name === b.name)
  }
}
