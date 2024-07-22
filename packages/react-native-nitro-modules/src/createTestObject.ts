import { NitroModules, type HybridObject } from '.'

export interface TestHybridObject extends HybridObject<{}> {
  // C++ getter & setter
  int: number
  string: string
  nullableString: string | undefined
  // C++ methods
  multipleArguments(
    first: number,
    second: boolean,
    third: string
  ): Record<string, number>
  getIntGetter(): () => number
  sayHelloCallback(callback: (name: string) => void): void
  createNewHybridObject(): TestHybridObject
  // C++ Threading
  calculateFibonacci(count: number): bigint
  calculateFibonacciAsync(count: number): Promise<bigint>
  asyncVoidFunc(): Promise<void>
  syncVoidFunc(): void
  // Errors
  throwError(): void
}

export function createCppTestHybridObject(): TestHybridObject {
  return NitroModules.get<TestHybridObject>('TestHybridObject')
}

export interface SwiftTestHybridObject extends HybridObject<{}> {
  // Swift getter & setter
  int: number
  // Swift methods
  throwError(): number
  asyncMethod(): Promise<number>
}

export function createSwiftTestHybridObject(): SwiftTestHybridObject {
  return NitroModules.get<SwiftTestHybridObject>('SwiftTestObject')
}
