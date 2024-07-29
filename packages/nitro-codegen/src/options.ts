// TODO: Allow configuring options through CLI
const CXX_BASE_NAMESPACE = ['margelo', 'nitro']
const CXX_NAMESPACE = ['image']
const ANDROID_BASE_NAMESPACE = ['com', 'margelo', 'nitro']
const ANDROID_NAMESPACE = ['image']
const ANDROID_CXX_LIB_NAME = 'NitroImage'
const IOS_MODULENAME = 'NitroImage'

/**
 * Returns the name of the Android C++ library (aka name in CMakeLists.txt `add_library(..)`).
 * This will be loaded via `System.loadLibrary(...)`.
 * @example `NitroImage`
 */
export function getAndroidCxxLibName(): string {
  return ANDROID_CXX_LIB_NAME
}

/**
 * Returns the iOS module name (aka Pod name) of the module that will be generated.
 * @example `NitroImage`
 */
export function getIosModuleName(): string {
  return IOS_MODULENAME
}

/**
 * Represents the C++ namespace of the module that will be generated.
 * This can have multiple sub-namespaces, and is always relative to `margelo::nitro`.
 * @example `['image']` -> `margelo::nitro::image`
 */
export function getCxxNamespace(
  language: 'c++' | 'swift',
  ...subDefinitionName: string[]
): string {
  const namespace = [
    ...CXX_BASE_NAMESPACE,
    ...CXX_NAMESPACE,
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
export function getAndroidPackage(
  language: 'java/kotlin' | 'c++/jni',
  ...subPackage: string[]
): string {
  const namespace = [
    ...ANDROID_BASE_NAMESPACE,
    ...ANDROID_NAMESPACE,
    ...subPackage,
  ]

  switch (language) {
    case 'java/kotlin':
      return namespace.join('.')
    case 'c++/jni':
      return 'L' + namespace.join('/') + ';'
    default:
      throw new Error(`Invalid language for getAndroidPackage: ${language}`)
  }
}
