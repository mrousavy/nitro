import type { TurboModule } from 'react-native'
import { TurboModuleRegistry } from 'react-native'
import type { UnsafeObject } from 'react-native/Libraries/Types/CodegenTypes'
import { ModuleNotFoundError } from './ModuleNotFoundError'
import NativeNitroOnLoad from './NativeNitroOnLoad'

// This TurboModule is *not* codegen'd.
// It's handwritten, because otherwise the app's CMakeLists wants to build it.
// Instead, we want to build it ourselves and have full control over the CMakeLists.
export interface NativeNitroSpec extends TurboModule {
  // Set up
  install(): void
  // Hybrid Objects stuff
  createHybridObject(name: string, args?: UnsafeObject): UnsafeObject
  hasHybridObject(name: string): boolean
  getAllHybridObjectNames(): string[]
  // JSI Helpers
  hasNativeState(obj: UnsafeObject): boolean
  removeNativeState(obj: UnsafeObject): void
  buildType: 'debug' | 'release'
  box(obj: UnsafeObject): UnsafeObject
}

let turboModule: NativeNitroSpec | undefined
export function getNativeNitroModules(): NativeNitroSpec {
  NativeNitroOnLoad.init()
  if (turboModule == null) {
    try {
      // 1. Get (and initialize) the C++ TurboModule
      turboModule =
        TurboModuleRegistry.getEnforcing<NativeNitroSpec>('NitroModulesCxx')

      // 2. Install Dispatcher and required bindings into the Runtime
      turboModule.install()
    } catch (e) {
      throw new ModuleNotFoundError(e)
    }
  }

  return turboModule
}

declare global {
  var __nitroModulesJSICache: {}
  var __nitroDispatcher: {}
}

export function isRuntimeAlive() {
  const cache = global.__nitroModulesJSICache
  const dispatcher = global.__nitroDispatcher
  return cache != null && dispatcher != null
}
