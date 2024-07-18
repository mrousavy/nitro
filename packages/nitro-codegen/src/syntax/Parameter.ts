import type { ParameterDeclaration } from 'ts-morph'
import type { CodeNode } from './CodeNode.js'
import { NamedTSType } from './TSType.js'
import { escapeCppName, removeDuplicates } from './helpers.js'
import type { Language } from '../getPlatformSpecs.js'
import type { SourceFile } from './SourceFile.js'

export class Parameter implements CodeNode {
  readonly name: string
  readonly type: NamedTSType

  constructor(param: ParameterDeclaration) {
    this.name = param.getSymbolOrThrow().getEscapedName()
    const type = param.getTypeNodeOrThrow().getType()
    const isOptional =
      param.hasQuestionToken() || param.isOptional() || type.isNullable()
    this.type = new NamedTSType(type, isOptional, this.name)
  }

  getCode(language: Language): string {
    const cppName = escapeCppName(this.name)
    switch (language) {
      case 'c++':
        return `${this.type.getCode()} ${cppName}`
      default:
        throw new Error(
          `Language ${language} is not yet supported for parameters!`
        )
    }
  }

  getDefinitionFiles(): SourceFile[] {
    return removeDuplicates(
      this.type.getDefinitionFiles(),
      (a, b) => a.name === b.name
    )
  }
}
