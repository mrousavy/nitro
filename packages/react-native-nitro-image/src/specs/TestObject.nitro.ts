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

interface SharedTestObjectProps {
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
  funcThatThrows(): number

  // Optional parameters
  tryOptionalParams(num: number, boo: boolean, str?: string): string
  tryMiddleParam(num: number, boo: boolean | undefined, str: string): string
  tryOptionalEnum(value?: Powertrain): Powertrain | undefined

  // Variants
  someVariant: number | string

  // Promises
  calculateFibonacciSync(value: number): bigint
  calculateFibonacciAsync(value: number): Promise<bigint>
  wait(seconds: number): Promise<void>

  // Callbacks
  callCallback(callback: () => void): void
  callAll(first: () => void, second: () => void, third: () => void): void
  callWithOptional(
    value: number | undefined,
    callback: (maybe: number | undefined) => void
  ): void

  // Objects
  getCar(): Car
  isCarElectric(car: Car): boolean
  getDriver(car: Car): Person | undefined

  // ArrayBuffers
  createArrayBuffer(): ArrayBuffer
  getBufferLastItem(buffer: ArrayBuffer): number
  setAllValuesTo(buffer: ArrayBuffer, value: number): void
}

export interface TestObjectCpp
  extends HybridObject<{ ios: 'c++' }>,
    SharedTestObjectProps {
  // Variants
  passVariant(
    either: number | string | number[] | string[] | boolean
  ): number | string

  // Complex variants
  getVariantEnum(variant: OldEnum | boolean): OldEnum | boolean
  getVariantObjects(variant: Person | Car): Person | Car
  getVariantHybrid(variant: TestObjectCpp | Person): TestObjectCpp | Person
  getVariantTuple(variant: Float2 | Float3): Float2 | Float3

  // Tuples
  someTuple: [number, string]
  flip(tuple: Float3): Float3
  passTuple(tuple: TestTuple): [number, string, boolean]

  // Callbacks that return values
  getValueFromJSCallbackAndWait(getValue: () => number): Promise<number>
  getValueFromJsCallback(
    callback: () => string,
    andThenCall: (valueFromJs: string) => void
  ): Promise<void>

  // Other HybridObjects
  readonly thisObject: TestObjectCpp
  newTestObject(): TestObjectCpp
}

export interface TestObjectSwiftKotlin
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }>,
    SharedTestObjectProps {
  // Other HybridObjects
  readonly thisObject: TestObjectSwiftKotlin
  newTestObject(): TestObjectSwiftKotlin
}

export interface Base extends HybridObject<{ ios: 'c++'; android: 'c++' }> {
  readonly baseValue: number
}

export interface Child extends Base {
  readonly childValue: number
}
