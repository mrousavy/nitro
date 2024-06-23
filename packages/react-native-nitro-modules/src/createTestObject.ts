import { NitroModules } from './NativeNitro';

interface TestHybridObject {
  // C++ getter & setter
  int: number;
  string: string;
  nullableString: string | undefined;
  // C++ methods
  multipleArguments(
    first: number,
    second: boolean,
    third: string
  ): Record<string, number>;
  getIntGetter(): () => number;
  sayHelloCallback(callback: (name: string) => void): void;
  createNewHybridObject(): TestHybridObject;
  // C++ Threading
  calculateFibonacci(count: number): bigint;
  calculateFibonacciAsync(count: number): Promise<bigint>;
}

export function createTestHybridObject(): TestHybridObject {
  return NitroModules.createTestHybridObject() as TestHybridObject;
}
