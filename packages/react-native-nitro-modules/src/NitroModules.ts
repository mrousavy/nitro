import { getNativeNitroModules } from './NativeNitroModules'
import type { HybridObject } from './HybridObject'

/**
 * Represents a boxed {@linkcode HybridObject} that can later be unboxed again.
 * This is implemented as a `jsi::HostObject`.
 */
export interface BoxedHybridObject<T extends HybridObject> {
  /**
   * Unboxes the {@linkcode HybridObject}.
   * This can be called from a different Runtime than the one it was boxed in.
   */
  unbox(): T
}

/**
 * A lazy proxy for initializing Nitro Modules HybridObjects.
 */
export const NitroModules = {
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
  createHybridObject<T extends HybridObject<any>>(name: string): T {
    const nitro = getNativeNitroModules()
    const instance = nitro.createHybridObject(name)
    return instance as T
  },
  /**
   * Get a list of all registered Hybrid Objects.
   */
  getAllHybridObjectNames(): string[] {
    const nitro = getNativeNitroModules()
    return nitro.getAllHybridObjectNames()
  },
  /**
   * Returns whether a HybridObject under the given {@linkcode name} is registered, or not.
   */
  hasHybridObject(name: string): boolean {
    const nitro = getNativeNitroModules()
    return nitro.hasHybridObject(name)
  },
  /**
   * Returns whether the given {@linkcode object} has a `NativeState` or not.
   *
   * This can be a quick way to check if an object is a valid {@linkcode HybridObject},
   * and has not yet been disposed.
   * @example
   * ```ts
   * const someObject = NitroModules.createHybridObject<Some>('Some')
   * console.log(NitroModules.hasNativeState(someObject)) // -> true
   * someObject.dispose()
   * console.log(NitroModules.hasNativeState(someObject)) // -> false
   * ```
   */
  hasNativeState(object: object): boolean {
    const nitro = getNativeNitroModules()
    return nitro.hasNativeState(object)
  },
  /**
   * Forcefully removes the `NativeState` of the given {@linkcode object}.
   */
  removeNativeState(object: object): void {
    const nitro = getNativeNitroModules()
    nitro.removeNativeState(object)
  },
  /**
   * Gets the current build type configuration as defined in the `NITRO_DEBUG`
   * preprocessor flag.
   */
  get buildType(): 'debug' | 'release' {
    const nitro = getNativeNitroModules()
    return nitro.getBuildType()
  },
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
  box<T extends HybridObject>(hybridObject: T): BoxedHybridObject<T> {
    const nitro = getNativeNitroModules()
    return nitro.box(hybridObject) as BoxedHybridObject<T>
  },
}
