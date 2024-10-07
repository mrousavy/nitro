import { ModuleNotFoundError } from './ModuleNotFoundError'
import type { NitroModulesProxy } from './NitroModulesProxy'
import { getNativeNitroModules } from './turbomodule/NativeNitroModules'

// Install `NitroModulesProxy` into this JS Runtime's `global`
const turboModule = getNativeNitroModules()
turboModule.install()

/**
 * Represents the entry point for all Nitro Modules (`HybridObject`s)
 */
// @ts-expect-error
export const NitroModules = global.NitroModulesProxy as NitroModulesProxy

// Check if install went successful
if (NitroModules == null) {
  const cause = new Error(
    'NitroModules was installed, but `global.NitroModulesProxy` was null!'
  )
  throw new ModuleNotFoundError(cause)
}
