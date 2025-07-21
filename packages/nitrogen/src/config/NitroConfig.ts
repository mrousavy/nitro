import chalk from 'chalk'
import { readUserConfig } from './getConfig.js'
import type { NitroUserConfig } from './NitroUserConfig.js'

const CXX_BASE_NAMESPACE = ['margelo', 'nitro']
const ANDROID_BASE_NAMESPACE = ['com', 'margelo', 'nitro']

/**
 * Represents the properly parsed `nitro.json` config of the current executing directory.
 */
export class NitroConfig {
  private readonly config: NitroUserConfig
  private static singleton: NitroConfig | undefined

  constructor(config: NitroUserConfig) {
    this.config = config
  }

  static get current(): NitroConfig {
    if (this.singleton == null) {
      console.log(
        chalk.reset(`🔧  Loading ${chalk.underline('nitro.json')} config...`)
      )
      const defaultConfigPath = './nitro.json'
      const config = readUserConfig(defaultConfigPath)
      this.singleton = new NitroConfig(config)
    }
    return this.singleton
  }

  /**
   * Returns the name of the Android C++ library (aka name in CMakeLists.txt `add_library(..)`).
   * This will be loaded via `System.loadLibrary(...)`.
   * @example `NitroTest`
   */
  getAndroidCxxLibName(): string {
    return this.config.android.androidCxxLibName
  }

  /**
   * Returns the iOS module name (aka Pod name) of the module that will be generated.
   * @example `NitroTest`
   */
  getIosModuleName(): string {
    return this.config.ios.iosModuleName
  }

  /**
   * Represents the C++ namespace of the module that will be generated.
   * This can have multiple sub-namespaces, and is always relative to `margelo::nitro`.
   * @example `['image']` -> `margelo::nitro::image`
   */
  getCxxNamespace(
    language: 'c++' | 'swift',
    ...subDefinitionName: string[]
  ): string {
    const userNamespace = this.config.cxxNamespace
    const namespace = [
      ...CXX_BASE_NAMESPACE,
      ...userNamespace,
      ...subDefinitionName,
    ]
    switch (language) {
      case 'c++':
        return namespace.join('::')
      case 'swift':
        return namespace.join('.')
      default:
        throw new Error(`Invalid language for getCxxNamespace: ${language}`)
    }
  }

  /**
   * Represents the Android namespace of the module that will be generated.
   * This can have multiple sub-namespaces, and is always relative to `com.margelo.nitro`.
   * @example `['image']` -> `com.margelo.nitro.image`
   */
  getAndroidPackage(
    language: 'java/kotlin' | 'c++/jni',
    ...subPackage: string[]
  ): string {
    const userPackage = this.config.android.androidNamespace
    const namespace = [...ANDROID_BASE_NAMESPACE, ...userPackage, ...subPackage]

    switch (language) {
      case 'java/kotlin':
        return namespace.join('.')
      case 'c++/jni':
        return namespace.join('/')
      default:
        throw new Error(`Invalid language for getAndroidPackage: ${language}`)
    }
  }

  /**
   * Return the directory of the android package, and a given sub-package.
   * This will be used on android to put files from a package in their respective package folder.
   */
  getAndroidPackageDirectory(...subPackage: string[]): string[] {
    const userPackage = this.config.android.androidNamespace
    return [...ANDROID_BASE_NAMESPACE, ...userPackage, ...subPackage]
  }

  /**
   * Get the autolinking configuration of all HybridObjects.
   * Those will be generated and default-constructed.
   */
  getAutolinkedHybridObjects(): NitroUserConfig['autolinking'] {
    return this.config.autolinking
  }

  /**
   * Get the paths that will be ignored when loading the TypeScript project.
   * In most cases, this just contains `node_modules/`.
   */
  getIgnorePaths(): string[] {
    return this.config.ignorePaths ?? []
  }

  getGitAttributesGeneratedFlag(): boolean {
    return this.config.gitAttributesGeneratedFlag ?? false
  }

  get isExternalConfig(): boolean {
    // If the C++ namespaces are NOT equal, we are an external config.
    return (
      this.getCxxNamespace('c++') !== NitroConfig.current.getCxxNamespace('c++')
    )
  }
}
