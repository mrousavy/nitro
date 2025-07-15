import deepEqual from 'deep-equal'
import { stringify } from './utils'

export type Must = 'equals' | 'throws'

const _someType = typeof false
export type JSType = typeof _someType

export class State<T> {
  readonly errorThrown: unknown | undefined
  readonly result: T | undefined

  constructor(result: T | undefined, error: unknown | undefined) {
    this.result = result
    this.errorThrown = error
  }

  private onPassed(): void {}

  private onFailed(reason: string): void {
    throw new Error(reason)
  }

  didThrow(message?: string): State<T> {
    if (this.errorThrown == null) {
      this.onFailed(
        `Expected test to throw an error, but no error was thrown! Instead it returned a result: ${stringify(this.result)}`
      )
    } else {
      if (message == null || stringify(this.errorThrown).includes(message)) {
        this.onPassed()
      } else {
        this.onFailed(
          `Expected test to throw "${message}", but it threw a different error: "${stringify(this.errorThrown)}"`
        )
      }
    }
    return this
  }

  didNotThrow(): State<T> {
    if (this.errorThrown != null) {
      this.onFailed(
        `Expected test to not throw any errors, but an error was thrown! Error: ${stringify(this.errorThrown)}`
      )
    } else {
      this.onPassed()
    }
    return this
  }

  equals(other: T): State<T> {
    if (!deepEqual(this.result, other)) {
      this.onFailed(
        `Expected "${stringify(this.result)}" (${typeof this.result}) to equal "${stringify(other)}" (${typeof other}), but they are not equal!`
      )
    } else {
      this.onPassed()
    }
    return this
  }

  didReturn(type: JSType): State<T> {
    if (typeof this.result !== type) {
      this.onFailed(
        `Expected ${stringify(this.result)}'s type (${typeof this.result}) to be ${type}!`
      )
    } else {
      this.onPassed()
    }
    return this
  }

  toContain(key: keyof T): State<T> {
    if (
      this.result != null &&
      (Object.hasOwn(this.result, key) ||
        this.result[key] != null ||
        // @ts-expect-error maybe a TypeScript bug? It's an object, so it's safe
        (typeof key === 'object' && key in this.result) ||
        Object.keys(this.result).includes(key as string))
    ) {
      this.onPassed()
    } else {
      this.onFailed(
        `Expected "${stringify(this.result)}" (${typeof this.result}) to contain ${String(key)}, but it didn't! Keys: ${Object.keys(this.result as any)}`
      )
    }
    return this
  }

  toBeArray(): State<T> {
    if (!Array.isArray(this.result)) {
      this.onFailed(
        `Expected "${stringify(this.result)}" (${typeof this.result}) to be an array, but it isn't!`
      )
    } else {
      this.onPassed()
    }
    return this
  }

  cleanup(func: () => void): State<T> {
    setTimeout(() => {
      func()
    }, 1000)
    return this
  }
}

export function it<T>(action: () => Promise<T>): Promise<State<T>>
export function it<T>(action: () => T): State<T>
export function it<T>(
  action: () => T | Promise<T>
): State<T> | Promise<State<T>> {
  try {
    const syncResult = action()
    if (syncResult instanceof Promise) {
      return syncResult
        .then((asyncResult) => new State<T>(asyncResult, undefined))
        .catch((error) => new State<T>(undefined, error))
    }
    return new State<T>(syncResult, undefined)
  } catch (e) {
    return new State<T>(undefined, e)
  }
}

export function callback<T, R>(func: (...args: T[]) => R): (...args: T[]) => R {
  return func
}
