import type { HostComponent, ViewProps } from 'react-native'
import type { HybridObject } from '../HybridObject'

/**
 * Describes the languages this view will be implemented in.
 */
export interface ViewPlatformSpec {
  ios?: 'swift'
  android?: 'kotlin'
}

/**
 * Represents props for a Hybrid View.
 * Such props are implemented on the native side, and can be
 * set from JS using React props.
 * @example
 * ```ts
 * // Definition:
 * type Direction = 'horizontal' | 'vertical'
 * interface ScrollViewProps extends HybridViewProps {
 *   direction: Direction
 * }
 * export type ScrollView = HybridView<ScrollViewProps>
 *
 * // in React:
 * function App() {
 *   return <HybridScrollView direction="vertical" />
 * }
 * ```
 */
export interface HybridViewProps {
  /* no default props */
}

/**
 * Represents methods for a Hybrid View.
 * Such methods are implemented on the native side, and can be
 * called from JS using the `hybridRef`.
 * @example
 * ```ts
 * // Definition:
 * interface ScrollViewProps extends HybridViewProps { … }
 * interface ScrollViewMethods extends HybridViewMethods {
 *   scrollTo(y: number): void
 * }
 * export type ScrollView = HybridView<ScrollViewProps, ScrollViewMethods>
 *
 * // in React:
 * function App() {
 *   const ref = useRef<ScrollView>(null)
 *   useLayoutEffect(() => {
 *     ref.current.scrollTo(400)
 *   }, [])
 *   return <HybridScrollView hybridRef={ref} />
 * }
 * ```
 */
export interface HybridViewMethods {}

/**
 * Represents all default props a Nitro HybridView has.
 */
interface DefaultHybridViewProps<Object> extends ViewProps {
  /**
   * A `ref` to the {@linkcode HybridObject} this Hybrid View is rendering.
   *
   * The `hybridRef` property expects a stable Ref object received from `useRef` or `createRef`.
   * @example
   * ```ts
   * function App() {
   *   const ref = useRef<ScrollView>(null)
   *   useLayoutEffect(() => {
   *     ref.current.scrollTo(400)
   *   }, [])
   *   return <HybridScrollView hybridRef={ref} />
   * }
   * ```
   */
  hybridRef?: { current: Object | null }
}

// Due to a React limitation, functions cannot be passed to native directly
// because RN converts them to booleans (`true`). Nitro knows this and just
// wraps functions as objects - the original function is stored in `f`.
type WrapFunctionsInObjects<Props> = {
  [K in keyof Props]: Props[K] extends Function ? { f: Props[K] } : Props[K]
}

/**
 * Represents a Nitro Hybrid View.
 *
 * The Hybrid View's implementation is in native iOS or Android, and is backed
 * by a {@linkcode HybridObject}.
 *
 * Each view has {@linkcode HybridViewProps}, and can optionally also
 * have custom {@linkcode HybridViewMethods}.
 *
 * Properties can be set using React props, and methods can be called after obtaining
 * a reference to the {@linkcode HybridObject} via {@linkcode DefaultHybridViewProps.hybridRef hybridRef}.
 *
 * The view can be rendered in React (Native).
 * @example
 * ```ts
 * interface ScrollViewProps extends HybridViewProps { … }
 * interface ScrollViewMethods extends HybridViewMethods { … }
 * export type ScrollView = HybridView<ScrollViewProps, ScrollViewMethods>
 * ```
 */
export interface HybridView<
  Props extends HybridViewProps,
  Methods extends HybridViewMethods = {},
  // @ts-expect-error
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Platforms extends ViewPlatformSpec = { ios: 'swift'; android: 'kotlin' },
  Object = HybridRef<Props, Methods>,
> extends HostComponent<
    WrapFunctionsInObjects<Props> & DefaultHybridViewProps<Object>
  > {
  /* no custom properties */
}

/**
 * The type of a {@linkcode DefaultHybridViewProps.hybridRef hybridRef}.
 * @example
 * ```ts
 * // declaration:
 * interface ScrollViewProps extends HybridViewProps { … }
 * interface ScrollViewMethods extends HybridViewMethods {
 *   scrollTo(y: number): void
 * }
 * export type ScrollView = HybridView<ScrollViewProps, ScrollViewMethods>
 * export type ScrollViewRef = HybridRef<ScrollViewProps, ScrollViewMethods>
 *
 * // in react:
 * function App() {
 *   const ref = useRef<ScrollViewRef>(null)
 *   useLayoutEffect(() => {
 *     ref.current.scrollTo(400)
 *   }, [])
 *   return <ScrollView hybridRef={ref} />
 * }
 * ```
 */
export type HybridRef<
  Props extends HybridViewProps,
  Methods extends HybridViewMethods = {},
> = HybridObject & Props & Methods
