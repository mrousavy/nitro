/**
 * Backend interface for assertions.
 * Each method corresponds to a State<T> assertion method.
 */
export interface AssertionBackend {
  /**
   * Assert that two values are deeply equal
   */
  assertEqual<T>(actual: T, expected: T, message: string): void

  /**
   * Assert that no error was thrown
   */
  assertNotThrow(error: unknown, result: unknown): void

  /**
   * Assert that an error was thrown, optionally containing a message
   */
  assertThrow(error: unknown, result: unknown, expectedMessage?: string): void

  /**
   * Assert that a value is of a specific JS type
   */
  assertType(value: unknown, expectedType: string, message: string): void

  /**
   * Assert that a value is an instance of a constructor
   */
  assertInstanceOf(value: unknown, constructor: Function, message: string): void

  /**
   * Assert that an object contains a key
   */
  assertContains(
    obj: unknown,
    key: string | number | symbol,
    message: string
  ): void

  /**
   * Assert that a value is an array
   */
  assertIsArray(value: unknown, message: string): void

  /**
   * Assert that a string contains a substring
   */
  assertStringContains(actual: string, substring: string, message: string): void
}

export type JSType =
  | 'string'
  | 'number'
  | 'bigint'
  | 'boolean'
  | 'symbol'
  | 'undefined'
  | 'object'
  | 'function'
