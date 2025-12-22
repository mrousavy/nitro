import { expect } from 'react-native-harness'
import deepEqual from 'deep-equal'
import type { AssertionBackend } from '../types'
import { stringify } from '../../utils'

/**
 * Harness backend for react-native-harness test runner.
 * Uses deep-equal for consistency with throwing backend.
 */
export const harnessBackend: AssertionBackend = {
  assertEqual<T>(actual: T, expected: T, message: string): void {
    // Use deep-equal for consistency with throwing backend
    if (!deepEqual(actual, expected)) {
      expect.fail(message)
    }
  },

  assertNotThrow(error: unknown, _result: unknown): void {
    if (error != null) {
      // Provide detailed error message
      expect.fail(
        `Expected test to not throw any errors, but an error was thrown! Error: ${stringify(error)}`
      )
    }
  },

  assertThrow(error: unknown, result: unknown, expectedMessage?: string): void {
    if (error == null) {
      expect.fail(
        `Expected test to throw an error, but no error was thrown! Instead it returned a result: ${stringify(result)}`
      )
    } else if (expectedMessage != null) {
      expect(stringify(error)).toContain(expectedMessage)
    }
  },

  assertType(value: unknown, expectedType: string, _message: string): void {
    expect(typeof value).toBe(expectedType)
  },

  assertInstanceOf(
    value: unknown,
    constructor: Function,
    _message: string
  ): void {
    expect(value).toBeInstanceOf(constructor)
  },

  assertContains(
    obj: unknown,
    key: string | number | symbol,
    message: string
  ): void {
    const hasKey =
      obj != null &&
      (Object.hasOwn(obj as object, key) ||
        (obj as Record<string | number | symbol, unknown>)[key] != null ||
        (typeof key === 'string' &&
          Object.keys(obj as object).includes(key as string)))

    if (!hasKey) {
      expect.fail(message)
    }
  },

  assertIsArray(value: unknown, _message: string): void {
    expect(Array.isArray(value)).toBe(true)
  },

  assertStringContains(
    actual: string,
    substring: string,
    _message: string
  ): void {
    expect(actual).toContain(substring)
  },
}
