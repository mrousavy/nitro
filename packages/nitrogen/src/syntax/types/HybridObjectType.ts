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

    if (this.hybridObjectName.startsWith('__')) {
      throw new Error(
        `HybridObject name cannot start with two underscores (__)! (In ${this.hybridObjectName})`
      )
    }
  }

  get canBePassedByReference(): boolean {
    // It's a shared_ptr<..>, no copy.
    return true
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
        return `any ${name.HybridTSpec}`
      }
      case 'kotlin': {
        return name.HybridTSpec
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
        language: 'c++',
        name: 'memory',
        space: 'system',
      },
      {
        name: `${name.HybridTSpec}.hpp`,
        forwardDeclaration: getForwardDeclaration(
          'class',
          name.HybridTSpec,
          cxxNamespace
        ),
        language: 'c++',
        space: 'user',
      },
    ]
  }
}
