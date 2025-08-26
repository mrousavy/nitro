import type { Language } from '../../getPlatformSpecs.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import type { Type, TypeKind } from './Type.js'

export class CustomType implements Type {
  canBePassedByReference: boolean
  typeName: string
  headerImport: string

  constructor(
    canBePassedByReference: boolean,
    typeName: string,
    headerImport: string
  ) {
    this.canBePassedByReference = canBePassedByReference
    this.typeName = typeName
    this.headerImport = headerImport
  }

  get kind(): TypeKind {
    return 'custom-type'
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return this.typeName
      default:
        throw new Error(
          `Language ${language} is not yet supported for CustomType "${this.typeName}"!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return []
  }
  getRequiredImports(language: Language): SourceImport[] {
    const imports: SourceImport[] = []
    if (language === 'c++') {
      imports.push({
        name: this.headerImport,
        language: 'c++',
        space: 'user',
      })
    }
    return imports
  }
}
