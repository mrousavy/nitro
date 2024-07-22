import type { Language } from '../../getPlatformSpecs.js'
import { escapeCppName } from '../helpers.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import type { NamedType, Type, TypeKind } from './Type.js'

export class NamedWrappingType<T extends Type> implements NamedType {
  readonly type: T
  readonly name: string

  constructor(name: string, type: T) {
    this.name = name
    this.type = type
  }

  get escapedName(): string {
    return escapeCppName(this.name)
  }
  get kind(): TypeKind {
    return this.type.kind
  }
  get canBePassedByReference(): boolean {
    return this.type.canBePassedByReference
  }
  getCode(language: Language): string {
    return this.type.getCode(language)
  }
  getExtraFiles(): SourceFile[] {
    return this.type.getExtraFiles()
  }
  getRequiredImports(): SourceImport[] {
    return this.type.getRequiredImports()
  }
}
