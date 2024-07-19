import type { Language } from '../../getPlatformSpecs.js'
import type { SourceFile } from '../SourceFile.js'
import type { Type } from './Type.js'

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

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
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
}
