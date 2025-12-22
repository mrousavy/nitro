import type { AssertionBackend, JSType } from './types'
import { stringify } from '../utils'

/**
 * Represents the state of a test execution with chainable assertions.
 * Uses the provided backend for actual assertion logic.
 */
export class State<T> {
  readonly errorThrown: unknown | undefined
  readonly result: T | undefined
  private readonly backend: AssertionBackend

  constructor(
    result: T | undefined,
    error: unknown | undefined,
    backend: AssertionBackend
  ) {
    this.result = result
    this.errorThrown = error
    this.backend = backend
  }

  didThrow(message?: string): State<T> {
    this.backend.assertThrow(this.errorThrown, this.result, message)
    return this
  }

  didNotThrow(): State<T> {
    this.backend.assertNotThrow(this.errorThrown, this.result)
    return this
  }

  equals(other: T): State<T> {
    this.backend.assertEqual(
      this.result,
      other,
      `Expected "${stringify(this.result)}" (${typeof this.result}) to equal "${stringify(other)}" (${typeof other}), but they are not equal!`
    )
    return this
  }

  didReturn(type: JSType): State<T> {
    this.backend.assertType(
      this.result,
      type,
      `Expected ${stringify(this.result)}'s type (${typeof this.result}) to be ${type}!`
    )
    return this
  }

  isInstanceOf(constructor: Function): State<T> {
    this.backend.assertInstanceOf(
      this.result,
      constructor,
      `Expected ${stringify(this.result)} to be an instance of ${constructor.name}!`
    )
    return this
  }

  toContain(key: keyof T): State<T> {
    this.backend.assertContains(
      this.result,
      key as string | number | symbol,
      `Expected "${stringify(this.result)}" (${typeof this.result}) to contain ${String(key)}, but it didn't! Keys: ${Object.keys(this.result as object)}`
    )
    return this
  }

  toBeArray(): State<T> {
    this.backend.assertIsArray(
      this.result,
      `Expected "${stringify(this.result)}" (${typeof this.result}) to be an array, but it isn't!`
    )
    return this
  }

  toStringContain(str: string): State<T> {
    // First check it's a string
    this.backend.assertType(
      this.result,
      'string',
      `Expected "${stringify(this.result)}" (${typeof this.result}) to be a string, but it isn't!`
    )
    // Then check it contains the substring
    this.backend.assertStringContains(
      this.result as string,
      str,
      `Expected "${this.result}" to contain the string "${str}", but it didn't!`
    )
    return this
  }

  cleanup(func: () => void): State<T> {
    setTimeout(() => {
      func()
    }, 1000)
    return this
  }
}
