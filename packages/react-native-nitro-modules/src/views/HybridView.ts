import type { HybridObject } from '../HybridObject'

/**
 * Describes the languages this view will be implemented in.
 */
export interface ViewPlatformSpec {
  ios?: 'swift'
  android?: 'kotlin'
}

/**
 * Represents a Nitro `HybridView` which is implemented in a native language
 * like Swift or Kotlin.
 *
 * `HybridViews`s use the Nitro Tunnel for efficient, low-overhead JS <-> Native communication.
 *
 * All `HybridViews`s have a C++ Fabric View base with a backing Shadow Node.
 *
 * - TypeScript Properties (`name: Type`) will be React Props
 * - TypeScript Methods (`name(): Type`) will be Ref Methods
 *
 * @example
 * ```tsx
 * export interface Camera extends HybridView {
 *   zoom: number
 *   flash: boolean
 *   takePhoto(): Image
 * }
 * ```
 */
export interface HybridView<
  Platforms extends ViewPlatformSpec = { ios: 'swift'; android: 'kotlin' },
> extends HybridObject<Platforms> {
  /* empty interface for now */
}

export * from './getHostComponent'
