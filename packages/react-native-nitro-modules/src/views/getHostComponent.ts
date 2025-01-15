import type { HostComponent } from 'react-native'
// @ts-expect-error this unfortunately isn't typed or default-exported.
import * as NativeComponentRegistry from 'react-native/Libraries/NativeComponent/NativeComponentRegistry'

interface ViewConfig<Props> {
  uiViewClassName: string
  supportsRawText?: boolean
  bubblingEventTypes: Record<string, unknown>
  directEventTypes: Record<string, unknown>
  validAttributes: Record<keyof Props, true>
}

/**
 * Finds and returns a native view (aka {@linkcode HostComponent}) via the given {@linkcode name}.
 */
export function getHostComponent<Props>(
  name: string,
  getViewConfig: () => ViewConfig<Props>
): HostComponent<Props> {
  return NativeComponentRegistry.get<Props>(name, getViewConfig)
}
