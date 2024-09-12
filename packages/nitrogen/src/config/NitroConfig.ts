import chalk from 'chalk'
import { readUserConfig } from './getConfig.js'
import type { NitroUserConfig } from './NitroUserConfig.js'

const CXX_BASE_NAMESPACE = ['margelo', 'nitro']
const ANDROID_BASE_NAMESPACE = ['com', 'margelo', 'nitro']

const defaultConfigPath = './nitro.json'

let userConfig: NitroUserConfig | undefined
export function getUserConfig(): NitroUserConfig {
  if (userConfig == null) {
    console.log(
      chalk.reset(`🔧  Loading ${chalk.underline('nitro.json')} config...`)
    )
    userConfig = readUserConfig(defaultConfigPath)
  }
  return userConfig
}

export function setUserConfigPath(path: string) {
  console.log(
    `🔧  Loading ${chalk.underline('nitro.json')} config from ${chalk.underline(path)}...`
  )
  userConfig = readUserConfig(path)
}

/**
 * Represents the properly parsed `nitro.json` config of the current executing directory.
 */
export const NitroConfig = {
  /**
   * Returns the name of the Android C++ library (aka name in CMakeLists.txt `add_library(..)`).
   * This will be loaded via `System.loadLibrary(...)`.
   * @example `NitroImage`
   */
  getAndroidCxxLibName(): string {
    return getUserConfig().android.androidCxxLibName
  },

  /**
   * Returns the iOS module name (aka Pod name) of the module that will be generated.
   * @example `NitroImage`
   */
  getIosModuleName(): string {
    return getUserConfig().ios.iosModulename
  },

  /**
   * Represents the C++ namespace of the module that will be generated.
   * This can have multiple sub-namespaces, and is always relative to `margelo::nitro`.
   * @example `['image']` -> `margelo::nitro::image`
   */
  getCxxNamespace(
    language: 'c++' | 'swift',
    ...subDefinitionName: string[]
  ): string {
    const userNamespace = getUserConfig().cxxNamespace
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
  },

  /**
   * Represents the Android namespace of the module that will be generated.
   * This can have multiple sub-namespaces, and is always relative to `com.margelo.nitro`.
   * @example `['image']` -> `com.margelo.nitro.image`
   */
  getAndroidPackage(
    language: 'java/kotlin' | 'c++/jni',
    ...subPackage: string[]
  ): string {
    const userPackage = getUserConfig().android.androidNamespace
    const namespace = [...ANDROID_BASE_NAMESPACE, ...userPackage, ...subPackage]

    switch (language) {
      case 'java/kotlin':
        return namespace.join('.')
      case 'c++/jni':
        return namespace.join('/')
      default:
        throw new Error(`Invalid language for getAndroidPackage: ${language}`)
    }
  },

  /**
   * Return the directory of the android package, and a given sub-package.
   * This will be used on android to put files from a package in their respective package folder.
   */
  getAndroidPackageDirectory(...subPackage: string[]): string[] {
    const userPackage = getUserConfig().android.androidNamespace
    return [...ANDROID_BASE_NAMESPACE, ...userPackage, ...subPackage]
  },

  /**
   * Get the paths that will be ignored when loading the TypeScript project.
   * In most cases, this just contains `node_modules/`.
   */
  getIgnorePaths(): string[] {
    return getUserConfig().ignorePaths ?? []
  },

  /**
   * Get the autolinking configuration of all HybridObjects.
   * Those will be generated and default-constructed.
   */
  getAutolinkedHybridObjects(): NitroUserConfig['autolinking'] {
    return getUserConfig().autolinking
  },
}
