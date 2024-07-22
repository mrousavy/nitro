import { NitroModules } from './NativeNitro'

export interface TestHybridObject {
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
  return NitroModules.createHybridObject('TestHybridObject') as TestHybridObject
}

export interface SwiftTestHybridObject {
  // Swift getter & setter
  int: number
  // Swift methods
  throwError(): number
  asyncMethod(): Promise<number>
}

export function createSwiftTestHybridObject(): SwiftTestHybridObject {
  return NitroModules.createHybridObject(
    'SwiftTestObject'
  ) as SwiftTestHybridObject
}
