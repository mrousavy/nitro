import { ts, type PropertySignature } from 'ts-morph'
import type { CodeNode, CppMethodSignature } from './CodeNode.js'
import { NamedTSType, VoidType } from './TSType.js'
import { capitalizeName } from '../stringUtils.js'
import { escapeCppName, removeDuplicates, toReferenceType } from './helpers.js'
import type { File } from './File.js'
import type { Language } from '../getPlatformSpecs.js'

export class Property implements CodeNode {
  readonly name: string
  readonly type: NamedTSType
  readonly isReadonly: boolean

  constructor(prop: PropertySignature) {
    this.name = prop.getSymbolOrThrow().getEscapedName()
    this.isReadonly = prop.hasModifier(ts.SyntaxKind.ReadonlyKeyword)
    const type = prop.getTypeNodeOrThrow().getType()
    const isOptional = prop.hasQuestionToken() || type.isNullable()
    this.type = new NamedTSType(type, isOptional, this.name)
  }

  get cppSignatures(): CppMethodSignature[] {
    const signatures: CppMethodSignature[] = []
    const capitalizedName = capitalizeName(escapeCppName(this.name))
    // getter
    signatures.push({
      returnType: this.type,
      rawName: this.name,
      name: `get${capitalizedName}`,
      parameters: [],
      type: 'getter',
    })
    if (!this.isReadonly) {
      // setter
      signatures.push({
        returnType: new VoidType(),
        rawName: this.name,
        name: `set${capitalizedName}`,
        parameters: [this.type],
        type: 'setter',
      })
    }
    return signatures
  }

  getDefinitionFiles(): File[] {
    return removeDuplicates(
      this.type.getDefinitionFiles(),
      (a, b) => a.name === b.name
    )
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        const signatures = this.cppSignatures
        const codeLines = signatures.map((s) => {
          const params = s.parameters.map((p) => {
            const paramType =
              p.passByConvention === 'by-reference'
                ? toReferenceType(p.getCode())
                : p.getCode()
            return `${paramType} ${p.name}`
          })
          return `virtual ${s.returnType.getCode()} ${s.name}(${params.join(', ')}) = 0;`
        })
        return codeLines.join('\n')
      default:
        throw new Error(
          `Language ${language} is not yet supported for properties!`
        )
    }
  }
}
