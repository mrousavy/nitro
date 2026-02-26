import type { Language } from '../../getPlatformSpecs.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import type { Type, TypeKind } from './Type.js'

export class BooleanType implements Type {
  get canBePassedByReference(): boolean {
    // It's a primitive.
    return false
  }

  get kind(): TypeKind {
    return 'boolean'
  }
  get isEquatable(): boolean {
    return true
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return 'bool'
      case 'swift':
        return 'Bool'
      case 'kotlin':
        return 'Boolean'
      case 'rust':
        return 'bool'
      default:
        throw new Error(
          `Language ${language} is not yet supported for BooleanType!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return []
  }
  getRequiredImports(): SourceImport[] {
    return []
  }
}
