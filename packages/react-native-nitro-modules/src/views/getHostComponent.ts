import { Platform, type HostComponent, type ViewProps } from 'react-native'
// @ts-expect-error this unfortunately isn't typed or default-exported.
import * as NativeComponentRegistry from 'react-native/Libraries/NativeComponent/NativeComponentRegistry'

export interface ViewConfig<Props> {
  uiViewClassName: string
  supportsRawText?: boolean
  bubblingEventTypes: Record<string, unknown>
  directEventTypes: Record<string, unknown>
  validAttributes: Record<keyof Props, boolean>
}

/**
 * Finds and returns a native view (aka {@linkcode HostComponent}) via the given {@linkcode name}.
 */
export function getHostComponent<Props>(
  name: string,
  getViewConfig: () => ViewConfig<Props>
): HostComponent<ViewProps & Props> {
  if (NativeComponentRegistry == null) {
    throw new Error(
      `NativeComponentRegistry is not available on ${Platform.OS}!`
    )
  }
  return NativeComponentRegistry.get<Props>(name, getViewConfig)
}
