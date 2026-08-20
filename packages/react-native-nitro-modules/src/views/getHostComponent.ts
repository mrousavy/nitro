import { Platform, type HostComponent, type ViewProps } from 'react-native'
// TODO: Migrate to the official export of `NativeComponentRegistry` from `react-native` once react-native 0.83.0 becomes more established as this is deprecated
// eslint-disable-next-line @react-native/no-deep-imports
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
type ReactNativeViewConfig = ReturnType<
  Parameters<typeof NativeComponentRegistry.get>[1]
>

function typesafe<Props>(config: ViewConfig<Props>): ReactNativeViewConfig {
  // TODO: Remove this unsafe cast and make it safe
  return config as ReactNativeViewConfig
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
   *       hybridRef={(ref) => {
   *         ref.current.scrollTo(400)
   *       }}
   *     />
   *   )
   * }
   * ```
   * @note On react-native 0.78 - 0.80, this has to be wrapped in
   * {@linkcode callback | callback(...)}. See
   * ["Callbacks"](https://nitro.margelo.com/docs/guides/view-components#callbacks).
   */
  hybridRef?: (ref: RefType) => void
}

/**
 * Wraps a callback function in a Nitro-compatible object format.
 *
 * @note Before react-native 0.81, functions could not be passed to native
 * directly because react-native converted them to booleans (`true`).
 * As a workaround, Nitro required you to wrap each function using `callback(...)`,
 * which bypassed react-native's conversion.
 * Since react-native 0.81, functions can be passed to Nitro Views directly, so
 * this type is only relevant on react-native 0.78 - 0.80.
 * Please see the [Callbacks](https://nitro.margelo.com/docs/guides/view-components#callbacks) section for more information.
 *
 * @type {Object} NitroViewWrappedCallback
 * @property {T} f - The wrapped callback function
 */
export type NitroViewWrappedCallback<T extends Function | undefined> = { f: T }

// Since react-native 0.81, functions can be passed to native directly.
// On react-native 0.78 - 0.80 they were converted to booleans (`true`), so
// Nitro also accepts functions wrapped in objects via `callback(...)` - the
// original function is then stored in `f`.
type AllowWrappedFunctions<Props> = {
  [K in keyof Props]: Props[K] extends Function
    ? Props[K] | NitroViewWrappedCallback<Props[K]>
    : Props[K] extends Function | undefined
      ? Props[K] | NitroViewWrappedCallback<Props[K]>
      : Props[K]
}

/**
 * Represents a React Native view, implemented as a Nitro View, with the given props and methods.
 *
 * @note Every React Native view has a {@linkcode DefaultHybridViewProps.hybridRef hybridRef} which can be used to gain access
 *       to the underlying Nitro {@linkcode HybridView}.
 * @note On react-native 0.78 - 0.80, every function/callback has to be wrapped as a `{ f: … }` object.
 *       Use {@linkcode callback | callback(...)} for this.
 * @note Every method can be called on the Ref. Including setting properties directly.
 */
export type ReactNativeView<
  Props extends HybridViewProps,
  Methods extends HybridViewMethods,
> = HostComponent<
  AllowWrappedFunctions<
    DefaultHybridViewProps<HybridView<Props, Methods>> & Props
  > &
    ViewProps
>

type ValidAttributes<Props> = ViewConfig<Props>['validAttributes']
/**
 * Wraps all valid attributes of {@linkcode TProps} using Nitro's
 * default `diff` and `process` functions.
 *
 * Both are required for Nitro to receive props unchanged:
 * - `diff` opts out of react-native's deep-differ, which ignores functions.
 * - `process` opts out of react-native converting function props to `true`
 *   (react-native 0.81 and above).
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
    return typesafe(config)
  })
}
