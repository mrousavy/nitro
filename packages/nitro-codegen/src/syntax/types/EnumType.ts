import type { Language } from '../../getPlatformSpecs.js'
import { getForwardDeclaration } from '../c++/getForwardDeclaration.js'
import { type SourceFile, type SourceImport } from '../SourceFile.js'
import type { ReferenceConvention, Type, TypeKind } from './Type.js'

export class EnumType implements Type {
  readonly enumName: string
  readonly declarationFile: SourceFile

  constructor(enumName: string, declarationFile: SourceFile) {
    this.enumName = enumName
    this.declarationFile = declarationFile
  }

  get convention(): ReferenceConvention {
    // It's an enum (int).
    return 'by-value'
  }

  get kind(): TypeKind {
    return 'enum'
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return this.enumName
      case 'swift':
        // TODO: Namespace?
        return this.enumName
      default:
        throw new Error(
          `Language ${language} is not yet supported for NumberType!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return [this.declarationFile]
  }
  getRequiredImports(): SourceImport[] {
    const extraImport: SourceImport = {
      name: this.declarationFile.name,
      language: this.declarationFile.language,
      forwardDeclaration: getForwardDeclaration('enum class', this.enumName),
    }
    return [extraImport]
  }
}
