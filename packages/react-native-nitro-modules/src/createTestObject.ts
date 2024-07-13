import { NitroModules } from './NativeNitro'

interface TestHybridObject {
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
  return NitroModules.createTestHybridObject() as TestHybridObject
}

export function createSwiftTestHybridObject(): TestHybridObject {
  return NitroModules.createSwiftTestHybridObject() as TestHybridObject
}
