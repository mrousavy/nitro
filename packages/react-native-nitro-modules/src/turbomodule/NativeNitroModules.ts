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

const jsVersion = require('react-native-nitro-modules/package.json').version

// 2. Prevent duplicate installs from multiple JS package instances
// @ts-expect-error
const alreadyInstalledNitro = global.NitroModulesProxy as
  | NitroModulesProxy
  | undefined
if (alreadyInstalledNitro != null) {
  throw new Error(
    `Nitro was installed twice: once with native version ${alreadyInstalledNitro.version} and once with JS version ${jsVersion}. ` +
      'This usually means react-native-nitro-modules exists multiple times in node_modules (e.g. in monorepos or double-linked setups).'
  )
}

// 3. Install Dispatcher and install `NitroModulesProxy` into the Runtime's `global`
const errorMessage = turboModule.install()
if (errorMessage != null) {
  throw new Error(`Failed to install Nitro: ${errorMessage}`)
}

// 4. Find `NitroModulesProxy` in `global`
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
