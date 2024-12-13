import type { HybridObject } from './HybridObject'
import type { BoxedHybridObject } from './BoxedHybridObject'

/**
 * The Proxy class that acts as a main entry point for Nitro Modules in React Native.
 *
 * This is a `HybridObject` on the native side as well, and is expected to be
 * installed into the runtime's `global` via the NativeModule/TurboModule's `install()` function.
 */
export interface NitroModulesProxy extends HybridObject {
  /**
   * Create a new instance of the `HybridObject` {@linkcode T}.
   *
   * {@linkcode T} has to be registered beforehand under the name {@linkcode name}
   * in the native Nitro Modules `HybridObjectRegistry`.
   *
   * @param name The name of the `HybridObject` under which it was registered at.
   * @returns An instance of {@linkcode T}
   * @throws an Error if {@linkcode T} has not been registered under the name {@linkcode name}.
   */
  createHybridObject<T extends HybridObject>(name: string): T
  /**
   * Returns whether a HybridObject under the given {@linkcode name} is registered, or not.
   */
  hasHybridObject(name: string): boolean
  /**
   * Get a list of all registered Hybrid Objects.
   */
  getAllHybridObjectNames(): string[]

  /**
   * Gets the current build type configuration as defined in the `NITRO_DEBUG`
   * preprocessor flag.
   */
  buildType: 'debug' | 'release'
  /**
   * Gets the native Nitro Modules core runtime version that this app is built with.
   * This should be kept in sync with the JS version (package.json), otherwise it could
   * introduce undefined behaviour.
   */
  version: string

  /**
   * Boxes the given {@linkcode hybridObject} into a {@linkcode BoxedHybridObject<T>}, which can
   * later be unboxed in a separate Runtime.
   *
   * While Nitro is runtime-agnostic and all `HybridObject`s can be used from a any Runtime,
   * some threading/worklet libraries (like [react-native-worklets-core](https://github.com/margelo/react-native-worklets-core))
   * do not yet support copying over `HybridObject`s as they use newer JSI APIs like `jsi::NativeState`.
   *
   * While those APIs are not yet available, you can still use every Nitro Hybrid Object in a separate
   * Runtime/Worklet context by just boxing it yourself:
   *
   * @example
   * ```ts
   * const something = NitroModules.createHybridObject<Something>('Something')
   * const boxed = NitroModules.box(something)
   * const context = Worklets.createContext('DummyContext')
   * context.runAsync(() => {
   *   'worklet'
   *   const unboxed = boxed.unbox()
   *   console.log(unboxed.name) // --> "Something"
   * })
   * ```
   */
  box<T extends HybridObject>(obj: T): BoxedHybridObject<T>

  /**
   * Returns whether the given {@linkcode object} has NativeState or not.
   */
  hasNativeState(object: unknown): boolean
}
