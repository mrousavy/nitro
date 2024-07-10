/**
 * Describes the languages this component will be implemented in.
 */
export interface PlatformSpec {
  ios?: 'swift' | 'c++';
  android?: 'kotlin' | 'c++';
}

/**
 * Represents a Nitro `HybridObject` which is implemented natively in either C++,
 * or Swift/Kotlin.
 *
 * Uses the Nitro Tunnel for efficient, low-overhead JS <-> Native communication.
 *
 * @example
 * ```ts
 * interface Photo extends HybridObject<{ ios: 'swift', android: 'kotlin' }> {
 *   readonly width: number
 *   readonly height: number
 *   toArrayBuffer(): ArrayBuffer
 *   saveToFile(path: string): Promise<void>
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface HybridObject<_ extends PlatformSpec> {}
