import type { CodeNode, CppMethodSignature } from './CodeNode.js'
import { escapeCppName, removeDuplicates, toReferenceType } from './helpers.js'
import type { Language } from '../getPlatformSpecs.js'
import type { SourceFile } from './SourceFile.js'
import { Parameter } from './Parameter.js'
import { TSType } from './TSType.js'
import type { MethodSignature } from 'ts-morph'

export class Method implements CodeNode {
  readonly name: string
  readonly returnType: TSType
  readonly parameters: Parameter[]

  constructor(prop: MethodSignature) {
    this.name = prop.getSymbolOrThrow().getEscapedName()
    const returnType = prop.getReturnTypeNodeOrThrow()
    const type = returnType.getType()
    const isOptional = type.isNullable()
    this.returnType = new TSType(type, isOptional)
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
      case 'c++':
        const signature = this.cppSignature
        const params = signature.parameters.map((p) => {
          const paramType =
            p.passByConvention === 'by-reference'
              ? toReferenceType(p.getCode())
              : p.getCode()
          return `${paramType} ${p.name}`
        })
        return `virtual ${signature.returnType.getCode()} ${signature.name}(${params.join(', ')}) = 0;`
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
    const returnTypeDefinitionFiles = this.returnType.getDefinitionFiles()
    const allFiles = [
      ...returnTypeDefinitionFiles,
      ...parametersDefinitionFiles,
    ]
    return removeDuplicates(allFiles, (a, b) => a.name === b.name)
  }
}
