import { type HybridObject, type AnyMap } from 'react-native-nitro-modules'

export type Float2 = [number, number]
export type Float3 = [number, number, number]
export type TestTuple = [number, string, boolean]

export type Powertrain = 'electric' | 'gas' | 'hybrid'

export enum OldEnum {
  FIRST,
  SECOND,
  THIRD,
}

export interface Car {
  year: number
  make: string
  model: string
  power: number
  powertrain: Powertrain
  driver?: Person
}

export interface Person {
  name: string
  age: number
}

export interface TestObject extends HybridObject<{ ios: 'c++' }> {
  // Test Primitives
  numberValue: number
  boolValue: boolean
  stringValue: string
  bigintValue: bigint
  stringOrUndefined: string | undefined
  stringOrNull: string | null
  optionalString?: string

  // Basic function tests
  simpleFunc(): void
  addNumbers(a: number, b: number): number
  addStrings(a: string, b: string): string
  multipleArguments(num: number, str: string, boo: boolean): void

  // Maps
  createMap(): AnyMap
  mapRoundtrip(map: AnyMap): AnyMap

  // Errors
  valueThatWillThrowOnAccess: number
  funcThatThrows(): number

  // Optional parameters
  tryOptionalParams(num: number, boo: boolean, str?: string): string
  tryMiddleParam(num: number, boo: boolean | undefined, str: string): string

  // Variants
  someVariant: number | string
  passVariant(
    either: number | string | number[] | string[] | boolean
  ): number | string

  // Complex variants
  getVariantEnum(variant: OldEnum | boolean): OldEnum | boolean
  getVariantObjects(variant: Person | Car): Person | Car
  getVariantHybrid(variant: TestObject | Person): TestObject | Person
  getVariantTuple(variant: Float2 | Float3): Float2 | Float3

  // Tuples
  someTuple: [number, string]
  flip(tuple: Float3): Float3
  passTuple(tuple: TestTuple): [number, string, boolean]

  // Promises
  calculateFibonacciSync(value: number): bigint
  calculateFibonacciAsync(value: number): Promise<bigint>
  wait(seconds: number): Promise<void>

  // Callbacks
  callCallback(callback: () => void): void
  getValueFromJSCallback(getValue: () => number): void
  getValueFromJSCallbackAndWait(getValue: () => number): Promise<number>
  callAll(first: () => void, second: () => void, third: () => void): void
  getValueFromJsCallback(
    callback: () => string,
    andThenCall: (valueFromJs: string) => void
  ): Promise<void>

  // Objects
  getCar(): Car
  isCarElectric(car: Car): boolean
  getDriver(car: Car): Person | undefined

  // ArrayBuffers
  createArrayBuffer(): ArrayBuffer
  getBufferLastItem(buffer: ArrayBuffer): number
  setAllValuesTo(buffer: ArrayBuffer, value: number): void

  // Other HybridObjects
  readonly self: TestObject
  newTestObject(): TestObject
}

interface CallbackHolder {
  callback: () => void
}

export interface SwiftKotlinTestObject extends HybridObject<{ ios: 'swift' }> {
  // Test Primitives
  numberValue: number
  boolValue: boolean
  stringValue: string
  bigintValue: bigint
  stringOrUndefined: string | undefined
  stringOrNull: string | null
  optionalString?: string

  // Basic function tests
  simpleFunc(): void
  addNumbers(a: number, b: number): number
  addStrings(a: string, b: string): string
  multipleArguments(num: number, str: string, boo: boolean): void

  getNumbers(): number[]
  getStrings(): string[]

  callCallback(callback: () => void): void

  someRecord: Record<string, number>
  someArray: string[]
  someOptional: string | undefined
  someMap: AnyMap

  car?: Car

  powertrain: Powertrain
  oldEnum: OldEnum

  buffer: ArrayBuffer
  createNewBuffer(size: number): ArrayBuffer
  newTestObject(): SwiftKotlinTestObject
  bounceBack(obj: SwiftKotlinTestObject): SwiftKotlinTestObject

  call(args: CallbackHolder): void

  getNumberAsync(): Promise<number>
  getStringAsync(): Promise<string>
  getCarAsync(): Promise<Car>

  doSomeStuff(
    withEnum: (value: Powertrain, str: string, buf: ArrayBuffer) => void
  ): void
}

export interface KotlinTestObject extends HybridObject<{ android: 'kotlin' }> {
  numberValue: number
  optionalNumber?: number

  primitiveArray: number[]
  carCollection: Car[]

  someBuffer: ArrayBuffer

  asyncTest(): Promise<void>

  createMap(): AnyMap
  mapRoundtrip(map: AnyMap): AnyMap

  addOnPersonBornListener(callback: (p: Person) => void): void

  someRecord: Record<string, string>

  someString: string
}
