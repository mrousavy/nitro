/**
 * Describes the languages this component will be implemented in.
 */
export interface PlatformSpec {
  ios?: 'swift' | 'c++'
  android?: 'kotlin' | 'c++'
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
export interface HybridObject<Spec extends PlatformSpec> {
  /**
   * Holds a type-name describing the native `HybridObject` instance.
   *
   * This is the only property actually present on the actual JavaScript object,
   * because all other properties and methods are inherited from a shared Prototype.
   *
   * @internal
   * @private
   * @note This value is available in debug only.
   */
  readonly __type?: string
  /**
   * The `HybridObject`'s name.
   */
  readonly name: string
  /**
   * Returns a string representation of the given `HybridObject`.
   *
   * Unless overridden by the `HybridObject`, this will return a list of all properties.
   *
   * @example
   * ```ts
   * const hybridA = SomeModule.getExistingHybridInstance()
   * console.log(hybridA.toString()) // [HybridObject HybridA]
   * ```
   */
  toString(): string
  /**
   * Returns whether this `HybridObject` is the same object as {@linkcode other}.
   *
   * While two `HybridObject`s might not be equal when compared with `==`, they might still
   * hold the same underlying `HybridObject`, in which case {@linkcode equals | equals(other)}
   * will return `true`.
   *
   * @example
   * ```ts
   * const hybridA = SomeModule.getExistingHybridInstance()
   * const hybridB = SomeModule.getExistingHybridInstance()
   * console.log(hybridA === hybridB) // false
   * console.log(hybridA.equals(hybridB)) // true
   * ```
   */
  equals(other: HybridObject<Spec>): boolean
}
