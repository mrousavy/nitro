import { getNativeNitroModules } from './NativeNitroModules'
import type { HybridObject } from './HybridObject'

// TODO: Do we wanna support such constructors?
// @ts-expect-error
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ExtractConstructors<T> = {
  [K in keyof T as K extends `constructor` ? `create` : never]: T[K]
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
}
