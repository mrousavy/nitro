import type { Language } from '../../getPlatformSpecs.js'
import { getForwardDeclaration } from '../c++/getForwardDeclaration.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import type { Type, TypeKind } from './Type.js'

export class ArrayBufferType implements Type {
  get canBePassedByReference(): boolean {
    return false
  }

  get kind(): TypeKind {
    return 'array-buffer'
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return 'std::shared_ptr<ArrayBuffer>'
      default:
        throw new Error(
          `Language ${language} is not yet supported for ArrayBufferType!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return []
  }
  getRequiredImports(): SourceImport[] {
    return [
      {
        name: 'NitroModules/ArrayBuffer.hpp',
        forwardDeclaration: getForwardDeclaration(
          'class',
          'ArrayBuffer',
          'NitroModules'
        ),
        language: 'c++',
      },
    ]
  }
}
