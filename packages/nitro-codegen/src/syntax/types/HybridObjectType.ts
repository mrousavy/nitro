import { NitroConfig } from '../../config/NitroConfig.js'
import type { Language } from '../../getPlatformSpecs.js'
import { getForwardDeclaration } from '../c++/getForwardDeclaration.js'
import { getHybridObjectName } from '../getHybridObjectName.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import type { Type, TypeKind } from './Type.js'

export class HybridObjectType implements Type {
  readonly hybridObjectName: string

  constructor(hybridObjectName: string) {
    this.hybridObjectName = hybridObjectName
  }

  get canBePassedByReference(): boolean {
    return false
  }

  get kind(): TypeKind {
    return 'hybrid-object'
  }

  getCode(language: Language): string {
    const name = getHybridObjectName(this.hybridObjectName)

    switch (language) {
      case 'c++': {
        const fullName = NitroConfig.getCxxNamespace('c++', name.HybridTSpec)
        return `std::shared_ptr<${fullName}>`
      }
      case 'swift': {
        const fullName = NitroConfig.getCxxNamespace('swift', name.HybridTSpec)
        return fullName
      }
      case 'kotlin': {
        const fullName = NitroConfig.getAndroidPackage(
          'java/kotlin',
          name.HybridTSpec
        )
        return fullName
      }
      default:
        throw new Error(
          `Language ${language} is not yet supported for HybridObjectType!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return []
  }
  getRequiredImports(): SourceImport[] {
    const name = getHybridObjectName(this.hybridObjectName)
    const cxxNamespace = NitroConfig.getCxxNamespace('c++')
    return [
      {
        name: `${name.HybridTSpec}.hpp`,
        forwardDeclaration: getForwardDeclaration(
          'class',
          name.HybridTSpec,
          cxxNamespace
        ),
        language: 'c++',
      },
    ]
  }
}
