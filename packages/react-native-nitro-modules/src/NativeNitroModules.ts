import type { TurboModule } from 'react-native'
import { TurboModuleRegistry } from 'react-native'
import type { UnsafeObject } from 'react-native/Libraries/Types/CodegenTypes'

export interface Spec extends TurboModule {
  install(): void
  createHybridObject(name: string, args?: UnsafeObject): UnsafeObject
}

// 1. Get (and initialize) the C++ TurboModule
export const NativeNitroModules =
  TurboModuleRegistry.getEnforcing<Spec>('NitroModulesCxx')

// 2. Install Dispatcher and required bindings into the Runtime
NativeNitroModules.install()
