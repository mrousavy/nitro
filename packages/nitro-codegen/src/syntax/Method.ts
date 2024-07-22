import type { CodeNode } from './CodeNode.js'
import type { Language } from '../getPlatformSpecs.js'
import type { SourceFile, SourceImport } from './SourceFile.js'
import { Parameter } from './Parameter.js'
import type { MethodSignature } from 'ts-morph'
import type { Type } from './types/Type.js'
import { createType } from './createType.js'
import { indent } from '../stringUtils.js'

export type MethodBody = string

export interface MethodModifiers {
  /**
   * Whether the function should be marked as inlineable.
   */
  inline?: boolean
  /*+
   * Whether the func is a pure virtual C++ function.
   */
  virtual?: boolean
  /**
   * Whether this function overrides a base/super function.
   */
  override?: boolean
}

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

  getCode(
    language: Language,
    modifiers?: MethodModifiers,
    body?: MethodBody
  ): string {
    body = body?.trim()

    switch (language) {
      case 'c++': {
        const returnType = this.returnType.getCode('c++')
        const params = this.parameters.map((p) => p.getCode('c++'))

        // C++ modifiers start in the beginning
        let signature = `${returnType} ${this.name}(${params.join(', ')})`
        if (modifiers?.inline) signature = `inline ${signature}`
        if (modifiers?.virtual) signature = `virtual ${signature}`
        if (modifiers?.override) signature = `${signature} override`

        if (body == null) {
          // It's a function declaration (no body)
          if (modifiers?.virtual) {
            // if it is a virtual function, we have no implementation (= 0)
            signature = `${signature} = 0`
          }
          return `${signature};`
        } else {
          return `
${signature} {
  ${indent(body, '  ')}
}`.trim()
        }
      }
      case 'swift': {
        const params = this.parameters.map((p) => p.getCode('swift'))
        const returnType = this.returnType.getCode('swift')
        let signature = `func ${this.name}(${params.join(', ')}) throws -> ${returnType}`

        if (modifiers?.inline) signature = `@inline(__always)\n${signature}`

        if (body == null) {
          return signature
        } else {
          return `
${signature} {
  ${indent(body, '  ')}
}`.trim()
        }
      }
      default:
        throw new Error(
          `Language ${language} is not yet supported for property getters!`
        )
    }
  }

  getExtraFiles(): SourceFile[] {
    const returnTypeExtraFiles = this.returnType.getExtraFiles()
    const paramsExtraFiles = this.parameters.flatMap((p) => p.getExtraFiles())
    return [...returnTypeExtraFiles, ...paramsExtraFiles]
  }

  getExtraImports(): SourceImport[] {
    const returnTypeFiles = this.returnType.getRequiredImports()
    const paramsImports = this.parameters.flatMap((p) => p.getExtraImports())
    return [...returnTypeFiles, ...paramsImports]
  }
}
