import { NativeNitroModules } from './NativeNitroModules'
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
  get<T extends HybridObject<any>>(name: string): T {
    const instance = NativeNitroModules.createHybridObject(name)
    return instance as T
  },
}
