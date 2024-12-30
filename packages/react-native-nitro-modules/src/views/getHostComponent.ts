import type { HostComponent } from 'react-native'
// @ts-expect-error this unfortunately isn't typed or default-exported.
import * as NativeComponentRegistry from 'react-native/Libraries/NativeComponent/NativeComponentRegistry'

/**
 * Finds and returns a native view (aka {@linkcode HostComponent}) via the given {@linkcode name}.
 */
export function getHostComponent<Props>(
  name: string,
  getViewConfig: () => object
): HostComponent<Props> {
  return NativeComponentRegistry.get<Props>(name, getViewConfig)
}
