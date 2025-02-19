import { Platform, type HostComponent, type ViewProps } from 'react-native'
// @ts-expect-error this unfortunately isn't typed or default-exported.
import * as NativeComponentRegistry from 'react-native/Libraries/NativeComponent/NativeComponentRegistry'
import type { HybridObject } from '../HybridObject'

export interface ViewConfig<Props> {
  uiViewClassName: string
  supportsRawText?: boolean
  bubblingEventTypes: Record<string, unknown>
  directEventTypes: Record<string, unknown>
  validAttributes: Record<keyof Props, boolean>
}

// Due to a React limitation, functions cannot be passed to native directly
// because RN converts them to booleans (`true`). Nitro knows this and just
// wraps functions as objects - the original function is stored in `f`.
type WrapFunctionsInObjects<THybridView> = {
  [K in keyof THybridView]: THybridView[K] extends Function
    ? { f: THybridView[K] }
    : THybridView[K]
}

// A Hybrid View doesn't need the props of it's base.
type RemoveHybridObjectBase<THybridObjectSub> = Omit<
  THybridObjectSub,
  keyof HybridObject
>

type CleanView<THybridView> = WrapFunctionsInObjects<
  RemoveHybridObjectBase<THybridView>
>

/**
 * Finds and returns a native view (aka {@linkcode HostComponent}) via the given {@linkcode name}.
 */
export function getHostComponent<Props>(
  name: string,
  getViewConfig: () => ViewConfig<RemoveHybridObjectBase<Props>>
): HostComponent<ViewProps & CleanView<Props>> {
  if (NativeComponentRegistry == null) {
    throw new Error(
      `NativeComponentRegistry is not available on ${Platform.OS}!`
    )
  }
  return NativeComponentRegistry.get(name, getViewConfig)
}
