import { ts, type PropertySignature } from 'ts-morph'
import type { CodeNode, CppMethodSignature } from './CodeNode.js'
import { capitalizeName } from '../stringUtils.js'
import { escapeCppName, removeDuplicates, toReferenceType } from './helpers.js'
import type { SourceFile } from './SourceFile.js'
import type { Language } from '../getPlatformSpecs.js'
import type { NamedType } from './types/Type.js'
import { createNamedType, createVoidType } from './createType.js'

export class Property implements CodeNode {
  readonly name: string
  readonly type: NamedType
  readonly isReadonly: boolean

  constructor(prop: PropertySignature) {
    this.name = prop.getSymbolOrThrow().getEscapedName()
    this.isReadonly = prop.hasModifier(ts.SyntaxKind.ReadonlyKeyword)
    const type = prop.getTypeNodeOrThrow().getType()
    const isOptional = prop.hasQuestionToken() || type.isNullable()
    this.type = createNamedType(this.name, type, isOptional)
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
        returnType: createVoidType(),
        rawName: this.name,
        name: `set${capitalizedName}`,
        parameters: [this.type],
        type: 'setter',
      })
    }
    return signatures
  }

  getDefinitionFiles(): SourceFile[] {
    return removeDuplicates(
      this.type.getExtraFiles(),
      (a, b) => a.name === b.name
    )
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        const signatures = this.cppSignatures
        const codeLines = signatures.map((s) => {
          const params = s.parameters.map((p) => {
            const paramType = p.canBePassedByReference
              ? toReferenceType(p.getCode('c++'))
              : p.getCode('c++')
            return `${paramType} ${p.name}`
          })
          return `virtual ${s.returnType.getCode('c++')} ${s.name}(${params.join(', ')}) = 0;`
        })
        return codeLines.join('\n')
      case 'swift':
        const type = this.type.getCode('swift')
        if (this.isReadonly) return `public var ${this.name}: ${type} { get }`
        else return `public var ${this.name}: ${type} { get set }`
      default:
        throw new Error(
          `Language ${language} is not yet supported for properties!`
        )
    }
  }
}
