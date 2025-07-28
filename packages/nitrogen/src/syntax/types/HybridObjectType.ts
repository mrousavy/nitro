import { type NitroConfig } from '../../config/NitroConfig.js'
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

  getCode(language: Language, mode: 'strong' | 'weak' = 'strong'): string {
    const name = getHybridObjectName(this.hybridObjectName)

    switch (language) {
      case 'c++': {
        const fullName = this.sourceConfig.getCxxNamespace(
          'c++',
          name.HybridTSpec
        )
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
        if (this.sourceConfig.isExternalConfig) {
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

  private getExternalCxxImportName(): string {
    // TODO: We currently don't have a xplat way of handling import paths, therefore iosModuleName and androidCxxLibName need to have the same value.
    if (
      this.sourceConfig.getIosModuleName() !==
      this.sourceConfig.getAndroidCxxLibName()
    ) {
      throw new Error(
        `Cannot import external HybridObject "${this.hybridObjectName}" if it's nitro.json's iosModuleName and androidCxxLibName are not the same value!`
      )
    }
    return this.sourceConfig.getIosModuleName()
  }

  getRequiredImports(language: Language): SourceImport[] {
    const name = getHybridObjectName(this.hybridObjectName)
    const cxxNamespace = this.sourceConfig.getCxxNamespace('c++')
    const imports: SourceImport[] = []

    switch (language) {
      case 'c++': {
        imports.push({
          language: 'c++',
          name: 'memory',
          space: 'system',
        })
        if (this.sourceConfig.isExternalConfig) {
          const cxxImport = this.getExternalCxxImportName()
          imports.push({
            name: `${cxxImport}/${name.HybridTSpec}.hpp`,
            forwardDeclaration: getForwardDeclaration(
              'class',
              name.HybridTSpec,
              cxxNamespace
            ),
            language: 'c++',
            space: 'system',
          })
        } else {
          imports.push({
            name: `${name.HybridTSpec}.hpp`,
            forwardDeclaration: getForwardDeclaration(
              'class',
              name.HybridTSpec,
              cxxNamespace
            ),
            language: 'c++',
            space: 'user',
          })
        }
        break
      }
      case 'kotlin': {
        if (this.sourceConfig.isExternalConfig) {
          imports.push({
            language: 'kotlin',
            name: this.sourceConfig.getAndroidPackage(
              'java/kotlin',
              name.HybridTSpec
            ),
            space: 'system',
          })
        }
        break
      }
      case 'swift': {
        if (this.sourceConfig.isExternalConfig) {
          imports.push({
            language: 'swift',
            name: this.sourceConfig.getIosModuleName(),
            space: 'system',
          })
        }
        break
      }
    }

    return imports
  }
}
