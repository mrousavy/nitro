import { Platform } from 'react-native'
import type { NitroViewWrappedCallback } from './getHostComponent'

let supportsRawFunctions: boolean | undefined

/**
 * Whether this version of react-native can transport JS functions to native as
 * raw functions (react-native 0.81.0 and above), instead of converting them to `true`.
 *
 * This has to match the `NITRO_RAW_FUNCTION_PROPS` flag on the native side (see `RawPropsCompat.hpp`).
 */
function supportsRawFunctionProps(): boolean {
  if (supportsRawFunctions == null) {
    const version = Platform.constants?.reactNativeVersion
    if (version == null) {
      // We cannot determine the version of react-native (e.g. in a JS-only
      // environment) - assume a recent version.
      supportsRawFunctions = true
    } else {
      supportsRawFunctions = version.major > 0 || version.minor >= 81
    }
  }
  return supportsRawFunctions
}

/**
 * Wrap the given {@linkcode func} in a Nitro callback.
 * - For react-native 0.81.0 and above, this just returns the function as-is.
 * - For older versions of react-native, this wraps the callback in a `{ f: T }` object.
 *
 * @deprecated Since react-native 0.81.0, functions can be passed to Nitro Views
 * directly - `<Camera onCaptured={(i) => console.log(i)} />` instead of
 * `<Camera onCaptured={callback((i) => console.log(i))} />`.
 * If you are still on react-native 0.78 - 0.80, upgrade to react-native 0.81 or
 * newer and remove all `callback(...)` calls.
 */
export function callback<T>(
  func: T
): T extends (...args: any[]) => any ? T | NitroViewWrappedCallback<T> : T
export function callback(func: unknown) {
  if (typeof func === 'function' && !supportsRawFunctionProps()) {
    return { f: func }
  }
  return func
}
