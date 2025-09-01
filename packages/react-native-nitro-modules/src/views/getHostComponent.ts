import { Platform, type HostComponent, type ViewProps } from 'react-native'
// @ts-expect-error this unfortunately isn't typed or default-exported.
import * as NativeComponentRegistry from 'react-native/Libraries/NativeComponent/NativeComponentRegistry'
import type {
  HybridView,
  HybridViewMethods,
  HybridViewProps,
} from './HybridView'

type AttributeValue<T, V = T> =
  | boolean
  | {
      diff?: (arg1: T, arg2: T) => boolean
      process?: (arg1: V) => T
    }

export interface ViewConfig<Props> {
  uiViewClassName: string
  supportsRawText?: boolean
  bubblingEventTypes: Record<string, unknown>
  directEventTypes: Record<string, unknown>
  validAttributes: {
    [K in keyof Props]: AttributeValue<Props[K]>
  }
}

/**
 * Represents all default props a Nitro HybridView has.
 */
interface DefaultHybridViewProps<RefType> {
  /**
   * A `ref` to the {@linkcode HybridObject} this Hybrid View is rendering.
   *
   * The `hybridRef` property expects a stable Ref object received from `useRef` or `createRef`.
   * @example
   * ```jsx
   * function App() {
   *   return (
   *     <HybridScrollView
   *       hybridRef={{ f: (ref) => {
   *         ref.current.scrollTo(400)
   *       }
   *     />
   *   )
   * }
   * ```
   */
  hybridRef?: (ref: RefType) => void
}

// Due to a React limitation, functions cannot be passed to native directly
// because RN converts them to booleans (`true`). Nitro knows this and just
// wraps functions as objects - the original function is stored in `f`.
type WrapFunctionsInObjects<Props> = {
  [K in keyof Props]: Props[K] extends Function
    ? { f: Props[K] }
    : Props[K] extends Function | undefined
      ? { f: Props[K] }
      : Props[K]
}

/**
 * Represents a React Native view, implemented as a Nitro View, with the given props and methods.
 *
 * @note Every React Native view has a {@linkcode DefaultHybridViewProps.hybridRef hybridRef} which can be used to gain access
 *       to the underlying Nitro {@linkcode HybridView}.
 * @note Every function/callback is wrapped as a `{ f: … }` object. Use {@linkcode callback | callback(...)} for this.
 * @note Every method can be called on the Ref. Including setting properties directly.
 */
export type ReactNativeView<
  Props extends HybridViewProps,
  Methods extends HybridViewMethods,
> = HostComponent<
  WrapFunctionsInObjects<
    DefaultHybridViewProps<HybridView<Props, Methods>> & Props
  > &
    ViewProps
>

type ValidAttributes<Props> = ViewConfig<Props>['validAttributes']
/**
 * Wraps all valid attributes of {@linkcode TProps} using Nitro's
 * default `diff` and `process` functions.
 */
function wrapValidAttributes<TProps>(
  attributes: ValidAttributes<TProps>
): ValidAttributes<TProps> {
  const keys = Object.keys(attributes) as (keyof ValidAttributes<TProps>)[]
  for (const key of keys) {
    attributes[key] = {
      diff: (a, b) => a !== b,
      process: (i) => i,
    }
  }
  return attributes
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
): ReactNativeView<Props, Methods> {
  if (NativeComponentRegistry == null) {
    throw new Error(
      `NativeComponentRegistry is not available on ${Platform.OS}!`
    )
  }
  return NativeComponentRegistry.get(name, () => {
    const config = getViewConfig()
    config.validAttributes = wrapValidAttributes(config.validAttributes)
    return config
  })
}

/**
 * Wrap the given {@linkcode func} in a Nitro callback.
 * - For older versions of react-native, this wraps the callback in a `{ f: T }` object.
 * - For newer versions of react-native, this just returns the function as-is.
 */
export function callback<T extends (...args: any[]) => any>(func: T): { f: T }
export function callback<T>(func: T): T
export function callback(func: unknown) {
  if (typeof func === 'function') {
    return { f: func }
  }
  return func
}
