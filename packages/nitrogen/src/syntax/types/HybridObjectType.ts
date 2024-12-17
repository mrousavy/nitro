import { NitroConfig } from '../../config/NitroConfig.js'
import type { Language } from '../../getPlatformSpecs.js'
import { getForwardDeclaration } from '../c++/getForwardDeclaration.js'
import { getHybridObjectName } from '../getHybridObjectName.js'
import type { HybridObjectSpec } from '../HybridObjectSpec.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import type { Type, TypeKind } from './Type.js'

export class HybridObjectType implements Type {
  readonly hybridObjectName: string
  readonly implementationLanguage: Language
  readonly baseTypes: HybridObjectType[]

  constructor(
    hybridObjectName: string,
    implementationLanguage: Language,
    baseTypes: HybridObjectType[]
  )
  constructor(spec: HybridObjectSpec)
  constructor(
    ...args:
      | [
          hybridObjectName: string,
          implementationLanguage: Language,
          baseTypes: HybridObjectType[],
        ]
      | [HybridObjectSpec]
  ) {
    if (args.length === 1) {
      const [spec] = args

      this.hybridObjectName = spec.name
      this.implementationLanguage = spec.language
      this.baseTypes = spec.baseTypes.map((b) => new HybridObjectType(b))
    } else {
      const [hybridObjectName, implementationLanguage, baseTypes] = args

      this.hybridObjectName = hybridObjectName
      this.implementationLanguage = implementationLanguage
      this.baseTypes = baseTypes
    }

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

  getCode(language: Language, mode: 'strong' | 'weak' = 'strong'): string {
    const name = getHybridObjectName(this.hybridObjectName)

    switch (language) {
      case 'c++': {
        const fullName = NitroConfig.getCxxNamespace('c++', name.HybridTSpec)
        if (mode === 'strong') {
          return `std::shared_ptr<${fullName}>`
        } else {
          return `std::weak_ptr<${fullName}>`
        }
      }
      case 'swift': {
        return `(any ${name.HybridTSpec})`
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
