import { Platform } from 'react-native'
// @ts-expect-error this unfortunately isn't typed or default-exported.
import * as NativeComponentRegistry from 'react-native/Libraries/NativeComponent/NativeComponentRegistry'
import type {
  HybridView,
  HybridViewMethods,
  HybridViewProps,
} from './HybridView'

export interface ViewConfig<Props> {
  uiViewClassName: string
  supportsRawText?: boolean
  bubblingEventTypes: Record<string, unknown>
  directEventTypes: Record<string, unknown>
  validAttributes: Record<keyof Props, boolean>
}

/**
 * Finds and returns a native view (aka "HostComponent") via the given {@linkcode name}.
 *
 * The view is bridged to a native Hybrid Object using Nitro Views.
 */
export function getHostComponent<
  Props extends HybridViewProps,
  Methods extends HybridViewMethods,
>(
  name: string,
  getViewConfig: () => ViewConfig<Props>
): HybridView<Props, Methods> {
  if (NativeComponentRegistry == null) {
    throw new Error(
      `NativeComponentRegistry is not available on ${Platform.OS}!`
    )
  }
  return NativeComponentRegistry.get(name, getViewConfig)
}
