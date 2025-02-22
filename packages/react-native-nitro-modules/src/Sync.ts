/**
 * Marks the given function as _synchronous_, allowing it to be called synchronously on the same
 * Thread. This is much faster and avoids any asynchronous dispatching, but requires careful
 * threading.
 */
export type Sync<T> = T extends Function ? T : never
