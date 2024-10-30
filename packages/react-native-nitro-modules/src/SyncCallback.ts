/**
 * Marks the given function {@linkcode T} as synchronous
 *
 * The function can then later be called synchronously and immediately from the native side,
 * without scheduling a call or delaying the result.
 *
 * This is useful if you have full control over the Threading and want to run instant callbacks,
 * like render callbacks in 3D engines.
 *
 * @example
 * ```ts
 * interface Scene extends HybridObject {
 *   startRendering(renderCallback: SyncCallback<() => void>): void
 * }
 * ```
 */
export type SyncCallback<T extends Function> = T & { __syncCallback?: true }
