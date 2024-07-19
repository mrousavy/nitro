import type { ParameterDeclaration } from 'ts-morph'
import type { CodeNode } from './CodeNode.js'
import { escapeCppName, removeDuplicates } from './helpers.js'
import type { Language } from '../getPlatformSpecs.js'
import type { SourceFile } from './SourceFile.js'
import type { NamedType } from './types/Type.js'
import { createNamedType } from './createType.js'

export class Parameter implements CodeNode {
  readonly type: NamedType

  constructor(param: ParameterDeclaration) {
    const name = param.getSymbolOrThrow().getEscapedName()
    const type = param.getTypeNodeOrThrow().getType()
    const isOptional =
      param.hasQuestionToken() || param.isOptional() || type.isNullable()
    this.type = createNamedType(name, param.getType(), isOptional)
  }

  get name(): string {
    return this.type.name
  }

  getCode(language: Language): string {
    const cppName = escapeCppName(this.name)
    switch (language) {
      case 'c++':
        return `${this.type.getCode(language)} ${cppName}`
      case 'swift':
        return `${cppName}: ${this.type.getCode(language)}`
      default:
        throw new Error(
          `Language ${language} is not yet supported for parameters!`
        )
    }
  }

  getDefinitionFiles(): SourceFile[] {
    return removeDuplicates(
      this.type.getExtraFiles(),
      (a, b) => a.name === b.name
    )
  }
}
