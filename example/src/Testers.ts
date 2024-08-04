import deepEqual from 'deep-equal'

export type Must = 'equals' | 'throws'

const _someType = typeof false
export type JSType = typeof _someType

export class State<T> {
  readonly testName: string
  readonly errorThrown: unknown | undefined
  readonly result: T | undefined

  constructor(
    testName: string,
    result: T | undefined,
    error: unknown | undefined
  ) {
    if (result != null) {
      console.log(`⏳ Test "${testName}" returned: ${result}`)
    } else if (error != null) {
      console.log(`⏳ Test "${testName}" threw: ${error}`)
    }
    this.testName = testName
    this.result = result
    this.errorThrown = error
  }

  private onPassed(): void {
    console.log(`✅ Test "${this.testName}" passed!`)
  }

  private onFailed(reason: string): void {
    console.log(`❌ Test "${this.testName}" failed!`, reason)
  }

  didThrow(): State<T> {
    if (this.errorThrown == null) {
      this.onFailed(
        `Expected ${this.testName} to throw an error, but no error was thrown! Instead it returned a result: ${this.result}`
      )
    }
    this.onPassed()
    return this
  }

  didNotThrow(): State<T> {
    if (this.errorThrown != null) {
      this.onFailed(
        `Expected ${this.testName} to not throw any errors, but an error was thrown! Error: ${this.errorThrown}`
      )
    }
    this.onPassed()
    return this
  }

  equals(other: T): State<T> {
    if (deepEqual(this.result, other)) {
      this.onFailed(
        `Expected ${this.result} (${typeof this.result}) to equal ${other} (${typeof other}), but they are not equal!`
      )
    }
    this.onPassed()
    return this
  }

  didReturn(type: JSType): State<T> {
    if (this.result == null || typeof this.result !== type) {
      this.onFailed(
        `Expected ${this.result}'s type (${typeof this.result}) to be ${type}!`
      )
    }
    this.onPassed()
    return this
  }

  toContain(key: keyof T): State<T> {
    if (this.result == null) {
      this.onFailed(
        `Expected ${this.testName} to return an object, but it returned ${this.result}.`
      )
    }
    // @ts-expect-error
    if (!Object.keys(this.result).includes(key)) {
      this.onFailed(
        `Expected ${this.result} to contain ${String(key)}, but it didn't!`
      )
    }
    this.onPassed()
    return this
  }
}

export function it<T>(testName: string, action: () => T): State<T>
export function it<T>(
  testName: string,
  action: () => Promise<T>
): Promise<State<T>>
export function it<T>(
  testName: string,
  action: () => T | Promise<T>
): State<T> | Promise<State<T>> {
  try {
    console.log(`⏳ Running test "${testName}"...`)
    const syncResult = action()
    if (syncResult instanceof Promise) {
      return syncResult
        .then((asyncResult) => new State<T>(testName, asyncResult, undefined))
        .catch((error) => new State<T>(testName, undefined, error))
    }
    return new State<T>(testName, syncResult, undefined)
  } catch (e) {
    return new State<T>(testName, undefined, e)
  }
}
