import type { Language } from '../../getPlatformSpecs.js'
import { escapeCppName } from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import type { NamedType, Type, TypeKind } from './Type.js'

export class NamedWrappingType implements NamedType {
  readonly type: Type
  readonly name: string

  constructor(name: string, type: Type) {
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
}
