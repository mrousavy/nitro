import type { TurboModule } from 'react-native'
import { TurboModuleRegistry } from 'react-native'
import type { UnsafeObject } from 'react-native/Libraries/Types/CodegenTypes'
import { ModuleNotFoundError } from './ModuleNotFoundError'

export interface Spec extends TurboModule {
  install(): void
  createHybridObject(name: string, args?: UnsafeObject): UnsafeObject
}

let turboModule: Spec | undefined
export function getNativeNitroModules(): Spec {
  if (turboModule == null) {
    try {
      // 1. Get (and initialize) the C++ TurboModule
      turboModule = TurboModuleRegistry.getEnforcing<Spec>('NitroModulesCxx')

      // 2. Install Dispatcher and required bindings into the Runtime
      turboModule.install()
    } catch (e) {
      throw new ModuleNotFoundError(e)
    }
  }

  return turboModule
}
