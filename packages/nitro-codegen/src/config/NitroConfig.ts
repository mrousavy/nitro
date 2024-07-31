import { getBaseDirectory } from '../getCurrentDir.js'
import { readCurrentConfig } from './getConfig.js'
import type { NitroUserConfig } from './NitroUserConfig.js'

const CXX_BASE_NAMESPACE = ['margelo', 'nitro']
const ANDROID_BASE_NAMESPACE = ['com', 'margelo', 'nitro']

export class NitroConfig {
  private userConfig: NitroUserConfig

  constructor(userConfig: NitroUserConfig) {
    this.userConfig = userConfig
  }

  /**
   * Returns the name of the Android C++ library (aka name in CMakeLists.txt `add_library(..)`).
   * This will be loaded via `System.loadLibrary(...)`.
   * @example `NitroImage`
   */
  get androidCxxLibName(): string {
    return this.userConfig.android.androidCxxLibName
  }

  /**
   * Returns the iOS module name (aka Pod name) of the module that will be generated.
   * @example `NitroImage`
   */
  get iosModuleName(): string {
    return this.userConfig.ios.iosModulename
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
    const userNamespace = this.userConfig.cxxNamespace
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
    const userPackage = this.userConfig.android.androidNamespace
    const namespace = [...ANDROID_BASE_NAMESPACE, ...userPackage, ...subPackage]

    switch (language) {
      case 'java/kotlin':
        return namespace.join('.')
      case 'c++/jni':
        return 'L' + namespace.join('/') + ';'
      default:
        throw new Error(`Invalid language for getAndroidPackage: ${language}`)
    }
  }

  /**
   * Return the directory of the android package, and a given sub-package.
   * This will be used on android to put files from a package in their respective package folder.
   */
  getAndroidPackageDirectory(...subPackage: string[]): string[] {
    const userPackage = this.userConfig.android.androidNamespace
    return [...ANDROID_BASE_NAMESPACE, ...userPackage, ...subPackage]
  }
}

const userConfig = await readCurrentConfig(getBaseDirectory())
export const CONFIG = new NitroConfig(userConfig)
