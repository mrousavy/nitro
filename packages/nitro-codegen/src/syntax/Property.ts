import { ts, type PropertySignature } from 'ts-morph'
import type { CodeNode } from './CodeNode.js'
import { capitalizeName } from '../stringUtils.js'
import { type SourceFile, type SourceImport } from './SourceFile.js'
import type { Language } from '../getPlatformSpecs.js'
import type { NamedType } from './types/Type.js'
import { createNamedType } from './createType.js'
import { Method } from './Method.js'
import { VoidType } from './types/VoidType.js'
import { Parameter } from './Parameter.js'

export interface PropertyBody {
  getter: string
  setter: string
}

export interface PropertyModifiers {
  /**
   * Whether the property should be marked as inlineable.
   */
  inline?: boolean
  /*+
   * Whether the property is a pure virtual C++ property (getter + setter).
   */
  virtual?: boolean
  /**
   * Whether this property overrides a base/super property.
   */
  override?: boolean
}

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

  getExtraFiles(): SourceFile[] {
    return this.type.getExtraFiles()
  }

  getRequiredImports(): SourceImport[] {
    return this.type.getRequiredImports()
  }

  get cppGetterName(): string {
    return `get${capitalizeName(this.name)}`
  }

  get cppSetterName(): string {
    return `set${capitalizeName(this.name)}`
  }

  get cppMethods(): [getter: Method] | [getter: Method, setter: Method] {
    const getter = new Method(this.cppGetterName, this.type, [])
    if (this.isReadonly) return [getter]
    const parameter = new Parameter(this.name, this.type)
    const setter = new Method(this.cppSetterName, new VoidType(), [parameter])
    return [getter, setter]
  }

  getCode(
    language: Language,
    modifiers?: PropertyModifiers,
    body?: PropertyBody
  ): string {
    if (body != null) {
      body.getter = body.getter.trim()
      body.setter = body.setter.trim()
    }

    switch (language) {
      case 'c++': {
        const methods = this.cppMethods
        const [getter, setter] = methods
        const lines: string[] = []
        lines.push(getter.getCode('c++', modifiers, body?.getter))
        if (setter != null) {
          lines.push(setter.getCode('c++', modifiers, body?.setter))
        }

        return lines.join('\n')
      }
      case 'swift': {
        const type = this.type.getCode('swift')
        let accessors: string
        if (body == null) {
          accessors = this.isReadonly ? `get` : `get set`
        } else {
          const lines: string[] = []
          lines.push(`
get {
  ${body.getter}
}
          `)
          if (!this.isReadonly) {
            lines.push(`
set {
  ${body.setter}
}
            `)
          }
          accessors = '\n' + lines.join('\n') + '\n'
        }
        return `var ${this.name}: ${type} { ${accessors} }`
      }
      default:
        throw new Error(
          `Language ${language} is not yet supported for properties!`
        )
    }
  }
}
