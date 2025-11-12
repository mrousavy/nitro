import type { Language } from '../../getPlatformSpecs.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import type { Type, TypeKind } from './Type.js'

export class NullType implements Type {
  get canBePassedByReference(): boolean {
    // It's a primitive.
    return false
  }
  get kind(): TypeKind {
    return 'null'
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return '[[maybe_unused]] nitro::NullType'
      case 'swift':
        return 'NullType'
      case 'kotlin':
        return 'NullType'
      default:
        throw new Error(
          `Language ${language} is not yet supported for NullType!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return []
  }
  getRequiredImports(language: Language): SourceImport[] {
    const imports: SourceImport[] = []
    switch (language) {
      case 'c++':
        imports.push({
          language: language,
          name: 'NitroModules/Null.hpp',
          space: 'system',
        })
        break
      case 'swift':
        imports.push({
          language: language,
          name: 'NitroModules',
          space: 'system',
        })
        break
      case 'kotlin':
        imports.push({
          language: language,
          name: 'com.margelo.nitro.core.NullType',
          space: 'system',
        })
        break
    }
    return imports
  }
}
