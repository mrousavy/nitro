import type { TurboModule } from 'react-native'
import { TurboModuleRegistry } from 'react-native'
import { ModuleNotFoundError } from '../ModuleNotFoundError'
import type { NitroModulesProxy } from '../NitroModulesProxy'

interface Spec extends TurboModule {
  /**
   * Installs `NitroModulesProxy` into this JS Runtime's `global`.
   * Also sets up a Dispatcher for the main JS Runtime.
   * @returns A `string` error message if this function failed to run, or `undefined` if everything went successful.
   */
  install(): string | undefined
}

// 1. Get (and initialize) the TurboModule
let turboModule: Spec | undefined
try {
  turboModule = TurboModuleRegistry.getEnforcing<Spec>('NitroModules')
} catch (e) {
  throw new ModuleNotFoundError(e)
}

// 2. Install Dispatcher and install `NitroModulesProxy` into the Runtime's `global`
const errorMessage = turboModule.install()
if (errorMessage != null) {
  throw new Error(`Failed to install Nitro: ${errorMessage}`)
}

// 3. Find `NitroModulesProxy` in `global`
// @ts-expect-error
export const NitroModules = global.NitroModulesProxy as NitroModulesProxy
if (NitroModules == null) {
  const cause = new Error(
    'NitroModules was installed, but `global.NitroModulesProxy` was null!'
  )
  throw new ModuleNotFoundError(cause)
}

// Double-check native version
if (__DEV__) {
  const jsVersion = require('react-native-nitro-modules/package.json').version
  if (jsVersion !== NitroModules.version) {
    console.warn(
      `The native Nitro Modules core runtime version is ${NitroModules.version}, but the JS code is using version ${jsVersion}. ` +
        `This could lead to undefined behaviour! Make sure to keep your Nitro versions in sync.`
    )
  }
}

export function isRuntimeAlive() {
  const cache = globalThis.__nitroJsiCache
  const dispatcher = globalThis.__nitroDispatcher
  return cache != null && dispatcher != null
}
