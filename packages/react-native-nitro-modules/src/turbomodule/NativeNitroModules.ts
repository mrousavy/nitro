import type { TurboModule } from 'react-native'
import { TurboModuleRegistry } from 'react-native'
import { ModuleNotFoundError } from '../ModuleNotFoundError'

export interface NativeNitroSpec extends TurboModule {
  /**
   * Installs `NitroModulesProxy` into this JS Runtime's `global`.
   * Also sets up a Dispatcher for the main JS Runtime.
   */
  install(): void
}

let turboModule: NativeNitroSpec | undefined
export function getNativeNitroModules(): NativeNitroSpec {
  if (turboModule == null) {
    try {
      // 1. Get (and initialize) the TurboModule
      turboModule =
        TurboModuleRegistry.getEnforcing<NativeNitroSpec>('NitroModules')

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
