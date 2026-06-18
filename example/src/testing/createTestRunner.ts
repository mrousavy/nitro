import type { AssertionBackend } from './types'
import { State } from './State'

function timeoutedPromise<T>(
  promise: Promise<T>,
  timeout: number = 1500
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    let didResolve = false
    requestAnimationFrame(() => {
      setImmediate(() => {
        setTimeout(() => {
          if (!didResolve) reject(new Error(`Timeouted!`))
        }, timeout)
      })
    })
    try {
      const r = await promise
      if (didResolve) {
        throw new Error(`Tried resolving Promise after it already timeouted!`)
      }
      didResolve = true
      resolve(r)
    } catch (e) {
      if (didResolve) {
        throw new Error(`Tried rejecting Promise after it already timeouted!`)
      }
      didResolve = true
      reject(e)
    }
  })
}

export interface TestRunner {
  it<T>(action: () => Promise<T>): Promise<State<T>>
  it<T>(action: () => T): State<T>
}

/**
 * Creates a test runner with the provided assertion backend.
 */
export function createTestRunner(backend: AssertionBackend): TestRunner {
  function it<T>(action: () => Promise<T>): Promise<State<T>>
  function it<T>(action: () => T): State<T>
  function it<T>(action: () => T | Promise<T>): State<T> | Promise<State<T>> {
    try {
      const syncResult = action()
      if (syncResult instanceof Promise) {
        const wrapped = timeoutedPromise<T>(syncResult)
        return wrapped
          .then((asyncResult) => new State<T>(asyncResult, undefined, backend))
          .catch((error) => new State<T>(undefined, error, backend))
      }
      return new State<T>(syncResult, undefined, backend)
    } catch (e) {
      return new State<T>(undefined, e, backend)
    }
  }

  return { it }
}
