import type { HybridObject } from './HybridObject'
import type { BoxedHybridObject } from './NitroModules'

/**
 * The Proxy class that acts as a main entry point for Nitro Modules in React Native.
 *
 * This is a `HybridObject` on the native side as well, and is expected to be
 * installed into the runtime's `global` via the NativeModule/TurboModule's `install()` function.
 */
export interface NitroModulesProxy extends HybridObject {
  // Hybrid Object Registry
  createHybridObject<T extends HybridObject>(name: string): T
  hasHybridObject(name: string): boolean
  getAllHybridObjectNames(): string[]

  // Build Info
  buildType: 'debug' | 'release'

  // Boxing
  box<T extends HybridObject>(obj: T): BoxedHybridObject<T>
}
