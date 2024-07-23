import type { Language } from '../../getPlatformSpecs.js'
import { getForwardDeclaration } from '../c++/getForwardDeclaration.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import type { ReferenceConvention, Type, TypeKind } from './Type.js'

export class ArrayBufferType implements Type {
  get convention(): ReferenceConvention {
    // It's a shared_ptr.
    return 'by-value'
  }

  get kind(): TypeKind {
    return 'array-buffer'
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return 'std::shared_ptr<ArrayBuffer>'
      case 'swift':
        return 'margelo.nitro.ArrayBuffer'
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
        name: 'ArrayBuffer.hpp',
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
