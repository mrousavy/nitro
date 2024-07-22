import type { Language } from '../../getPlatformSpecs.js'
import {
  getSourceFileImport,
  type SourceFile,
  type SourceImport,
} from '../SourceFile.js'
import type { Type, TypeKind } from './Type.js'

export class StructType implements Type {
  readonly structName: string
  readonly declarationFile: SourceFile

  constructor(structName: string, declarationFile: SourceFile) {
    this.structName = structName
    this.declarationFile = declarationFile
  }

  get canBePassedByReference(): boolean {
    return true
  }
  get kind(): TypeKind {
    return 'struct'
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return this.structName
      case 'swift':
        // TODO: Namespace?
        return this.structName
      default:
        throw new Error(
          `Language ${language} is not yet supported for StructType!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return [this.declarationFile]
  }
  getRequiredImports(): SourceImport[] {
    return this.getExtraFiles().map((f) => getSourceFileImport(f))
  }
}
