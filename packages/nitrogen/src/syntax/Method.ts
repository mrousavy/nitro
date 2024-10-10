import type { CodeNode } from './CodeNode.js'
import type { Language } from '../getPlatformSpecs.js'
import { type SourceFile, type SourceImport } from './SourceFile.js'
import { Parameter } from './Parameter.js'
import type { MethodSignature } from 'ts-morph'
import type { Type } from './types/Type.js'
import { createType } from './createType.js'
import { indent } from '../utils.js'

export type MethodBody = string

export interface MethodModifiers {
  /**
   * The name of the class that defines this C++ method.
   * Example: `Person` -> `void Person::sayHi()`
   */
  classDefinitionName?: string
  /**
   * Whether the function should be marked as inlineable.
   */
  inline?: boolean
  /*+
   * Whether the func is a pure virtual C++ function.
   */
  virtual?: boolean
  /**
   * Whether the function is marked as `noexcept` (doesn't throw) or not.
   */
  noexcept?: boolean
  /**
   * Whether this function overrides a base/super function.
   */
  override?: boolean
  /**
   * Whether this method has a `@DoNotStrip` and `@Keep` attribute to avoid
   * it from being stripped from the binary by the Java compiler or ProGuard.
   */
  doNotStrip?: boolean
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
      const [method] = args
      this.name = method.getSymbolOrThrow().getEscapedName()
      const returnType = method.getReturnType()
      this.returnType = createType(returnType, returnType.isNullable())
      this.parameters = method.getParameters().map((p) => new Parameter(p))
    }
    if (this.name.startsWith('__')) {
      throw new Error(
        `Method names are not allowed to start with two underscores (__)! (In ${this.jsSignature})`
      )
    }
  }

  get jsSignature(): string {
    const returnType = this.returnType.kind
    const params = this.parameters.map((p) => `${p.name}: ${p.type.kind}`)
    return `${this.name}(${params.join(', ')}): ${returnType}`
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
        const name = modifiers?.classDefinitionName
          ? `${modifiers.classDefinitionName}::${this.name}`
          : this.name
        let signature = `${returnType} ${name}(${params.join(', ')})`
        if (modifiers?.inline) signature = `inline ${signature}`
        if (modifiers?.virtual) signature = `virtual ${signature}`
        if (modifiers?.noexcept) signature = `${signature} noexcept`
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
      case 'kotlin': {
        const params = this.parameters.map((p) => p.getCode('kotlin'))
        const returnType = this.returnType.getCode('kotlin')
        let signature = `fun ${this.name}(${params.join(', ')}): ${returnType}`

        if (modifiers?.inline) signature = `inline ${signature}`
        if (modifiers?.override) signature = `override ${signature}`
        if (modifiers?.virtual) signature = `abstract ${signature}`
        if (modifiers?.doNotStrip)
          signature = `@DoNotStrip\n@Keep\n${signature}`

        if (body == null) {
          return signature
        } else {
          return `
${signature} {
  ${indent(body, '  ')}
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

  getExtraFiles(): SourceFile[] {
    const returnTypeExtraFiles = this.returnType.getExtraFiles()
    const paramsExtraFiles = this.parameters.flatMap((p) => p.getExtraFiles())
    return [...returnTypeExtraFiles, ...paramsExtraFiles]
  }

  getRequiredImports(): SourceImport[] {
    const returnTypeFiles = this.returnType.getRequiredImports()
    const paramsImports = this.parameters.flatMap((p) => p.getRequiredImports())
    return [...returnTypeFiles, ...paramsImports]
  }
}
