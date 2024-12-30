interface ViewPlatformSpec {
  ios?: 'swift'
  android?: 'kotlin'
}

/**
 * Represents the React props of a Nitro {@linkcode HybridView}.
 */
export interface HybridViewProps {}

/**
 * Represents the methods of the React `ref` to a Nitro {@linkcode HybridView}.
 */
export interface HybridViewMethods {}

/**
 * Represents a Nitro `HybridView` which is implemented in a native language
 * like Swift or Kotlin.
 *
 * `HybridViews`s use the Nitro Tunnel for efficient, low-overhead JS <-> Native communication.
 *
 * All `HybridViews`s have a C++ Fabric View base with a backing Shadow Node.
 *
 * @example
 * ```tsx
 * export interface ImageProps extends HybridViewProps {
 *   source: string
 * }
 * export interface ImageMethods extends HybridViewMethods {
 *   takeScreenshot(): void
 * }
 * export type ImageView = HybridView<ImageProps, ImageMethods>
 * ```
 */
export interface HybridView<
  Props extends HybridViewProps,
  Methods extends HybridViewMethods = {},
  Platforms extends ViewPlatformSpec = { ios: 'swift'; android: 'kotlin' },
> {
  readonly __tag?: HybridView<Props, Methods, Platforms> & never
}

export * from './views/getHostComponent'
