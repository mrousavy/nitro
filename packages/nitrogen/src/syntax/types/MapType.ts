import type { Language } from '../../getPlatformSpecs.js'
import { getForwardDeclaration } from '../c++/getForwardDeclaration.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import type { Type, TypeKind } from './Type.js'

export class MapType implements Type {
  get canBePassedByReference(): boolean {
    // It's a shared_ptr<..>, no ref.
    return true
  }

  get kind(): TypeKind {
    return 'map'
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return 'std::shared_ptr<AnyMap>'
      case 'swift':
        return 'AnyMap'
      case 'kotlin':
        return 'AnyMap'
      default:
        throw new Error(
          `Language ${language} is not yet supported for MapType!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return []
  }
  getRequiredImports(): SourceImport[] {
    return [
      {
        name: 'NitroModules/AnyMap.hpp',
        forwardDeclaration: getForwardDeclaration(
          'class',
          'AnyMap',
          'NitroModules'
        ),
        language: 'c++',
        space: 'system',
      },
    ]
  }
}
