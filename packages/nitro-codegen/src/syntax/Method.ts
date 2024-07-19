import type { CodeNode, CppMethodSignature } from './CodeNode.js'
import { escapeCppName, removeDuplicates, toReferenceType } from './helpers.js'
import type { Language } from '../getPlatformSpecs.js'
import type { SourceFile } from './SourceFile.js'
import { Parameter } from './Parameter.js'
import type { MethodSignature } from 'ts-morph'
import type { Type } from './types/Type.js'
import { createType } from './createType.js'

export class Method implements CodeNode {
  readonly name: string
  readonly returnType: Type
  readonly parameters: Parameter[]

  constructor(prop: MethodSignature) {
    this.name = prop.getSymbolOrThrow().getEscapedName()
    const returnType = prop.getReturnType()
    const isOptional = returnType.isNullable()
    this.returnType = createType(returnType, isOptional)
    this.parameters = prop.getParameters().map((p) => new Parameter(p))
  }

  get cppSignature(): CppMethodSignature {
    const cppName = escapeCppName(this.name)
    return {
      rawName: this.name,
      name: cppName,
      returnType: this.returnType,
      parameters: this.parameters.map((p) => p.type),
      type: 'method',
    }
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++': {
        const signature = this.cppSignature
        const params = signature.parameters.map((p) => {
          const paramType = p.canBePassedByReference
            ? toReferenceType(p.getCode('c++'))
            : p.getCode('c++')
          return `${paramType} ${p.name}`
        })
        return `virtual ${signature.returnType.getCode('c++')} ${signature.name}(${params.join(', ')}) = 0;`
      }
      case 'swift': {
        const params = this.parameters.map((p) => p.getCode('swift'))
        const returnType = this.returnType.getCode('swift')
        return `public func ${this.name}(${params.join(', ')}) throws -> ${returnType}`
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
