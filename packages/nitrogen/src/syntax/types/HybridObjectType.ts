import { type NitroConfig } from '../../config/NitroConfig.js'
import type { Language } from '../../getPlatformSpecs.js'
import { getHybridObjectName } from '../getHybridObjectName.js'
import type { HybridObjectSpec } from '../HybridObjectSpec.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import type { GetCodeOptions, Type, TypeKind } from './Type.js'

interface GetHybridObjectCodeOptions extends GetCodeOptions {
  mode?: 'strong' | 'weak'
}

export class HybridObjectType implements Type {
  readonly hybridObjectName: string
  readonly implementationLanguage: Language
  readonly baseTypes: HybridObjectType[]
  readonly sourceConfig: NitroConfig

  constructor(
    hybridObjectName: string,
    implementationLanguage: Language,
    baseTypes: HybridObjectType[],
    sourceConfig: NitroConfig
  )
  constructor(spec: HybridObjectSpec)
  constructor(
    ...args:
      | [
          hybridObjectName: string,
          implementationLanguage: Language,
          baseTypes: HybridObjectType[],
          sourceConfig: NitroConfig,
        ]
      | [HybridObjectSpec]
  ) {
    if (args.length === 1) {
      const [spec] = args

      this.hybridObjectName = spec.name
      this.implementationLanguage = spec.language
      this.sourceConfig = spec.config
      this.baseTypes = spec.baseTypes.map((b) => new HybridObjectType(b))
    } else {
      const [
        hybridObjectName,
        implementationLanguage,
        baseTypes,
        sourceConfig,
      ] = args

      this.hybridObjectName = hybridObjectName
      this.implementationLanguage = implementationLanguage
      this.baseTypes = baseTypes
      this.sourceConfig = sourceConfig
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

  getCode(
    language: Language,
    options: GetHybridObjectCodeOptions = {}
  ): string {
    const name = getHybridObjectName(this.hybridObjectName)
    const mode = options.mode ?? 'strong'
    const fullyQualified =
      options.fullyQualified ?? this.sourceConfig.isExternalConfig

    switch (language) {
      case 'c++': {
        const ptrType = mode === 'strong' ? 'std::shared_ptr' : 'std::weak_ptr'
        if (fullyQualified) {
          const fullName = this.sourceConfig.getCxxNamespace(
            'c++',
            name.HybridTSpec
          )
          return `${ptrType}<${fullName}>`
        } else {
          return `${ptrType}<${name.HybridTSpec}>`
        }
      }
      case 'swift': {
        return `(any ${name.HybridTSpec})`
      }
      case 'kotlin': {
        if (fullyQualified) {
          // full qualified name: "com.margelo.nitro.image.Image"
          return this.sourceConfig.getAndroidPackage(
            'java/kotlin',
            name.HybridTSpec
          )
        } else {
          // "Image"
          return name.HybridTSpec
        }
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

  getRequiredImports(language: Language): SourceImport[] {
    const name = getHybridObjectName(this.hybridObjectName)
    const imports: SourceImport[] = this.sourceConfig.getRequiredImports(
      language,
      'class',
      name.HybridTSpec
    )

    switch (language) {
      case 'c++': {
        imports.push({
          language: 'c++',
          name: 'memory',
          space: 'system',
        })
        break
      }
      default:
        break
    }

    return imports
  }
}
