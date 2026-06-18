import deepEqual from 'deep-equal'
import type { AssertionBackend } from '../types'
import { stringify } from '../../utils'

/**
 * Throwing backend for in-app test runner.
 * Throws an error when an assertion fails.
 */
export const throwingBackend: AssertionBackend = {
  assertEqual<T>(actual: T, expected: T, message: string): void {
    if (!deepEqual(actual, expected)) {
      throw new Error(message)
    }
  },

  assertNotThrow(error: unknown, _result: unknown): void {
    if (error != null) {
      throw new Error(
        `Expected test to not throw any errors, but an error was thrown! Error: ${stringify(error)}`
      )
    }
  },

  assertThrow(error: unknown, result: unknown, expectedMessage?: string): void {
    if (error == null) {
      throw new Error(
        `Expected test to throw an error, but no error was thrown! Instead it returned a result: ${stringify(result)}`
      )
    } else {
      if (
        expectedMessage != null &&
        !stringify(error).includes(expectedMessage)
      ) {
        throw new Error(
          `Expected test to throw "${expectedMessage}", but it threw a different error: "${stringify(error)}"`
        )
      }
    }
  },

  assertType(value: unknown, expectedType: string, message: string): void {
    if (typeof value !== expectedType) {
      throw new Error(message)
    }
  },

  assertInstanceOf(
    value: unknown,
    constructor: Function,
    message: string
  ): void {
    if (!(value instanceof constructor)) {
      throw new Error(message)
    }
  },

  assertContains(
    obj: unknown,
    key: string | number | symbol,
    message: string
  ): void {
    if (
      obj != null &&
      (Object.hasOwn(obj as object, key) ||
        (obj as Record<string | number | symbol, unknown>)[key] != null ||
        (typeof key === 'string' &&
          Object.keys(obj as object).includes(key as string)))
    ) {
      // passed
    } else {
      throw new Error(message)
    }
  },

  assertIsArray(value: unknown, message: string): void {
    if (!Array.isArray(value)) {
      throw new Error(message)
    }
  },

  assertStringContains(
    actual: string,
    substring: string,
    message: string
  ): void {
    if (!actual.includes(substring)) {
      throw new Error(message)
    }
  },
}
