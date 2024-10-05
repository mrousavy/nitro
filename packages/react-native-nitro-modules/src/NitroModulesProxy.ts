import type { HybridObject } from './HybridObject'
import type { BoxedHybridObject } from './NitroModules'

export interface NitroModulesProxy extends HybridObject {
  // Hybrid Object Registry
  createHybridObject(name: string): HybridObject
  hasHybridObject(name: string): boolean
  getAllHybridObjectNames(): string[]

  // Build Info
  buildType: 'debug' | 'release'

  // Boxing
  box<T extends HybridObject>(obj: T): BoxedHybridObject<T>
}
