import { type HybridObject, type AnyMap } from 'react-native-nitro-modules'

// Tuples become `std::tuple<...>` in C++.
// In contrast to arrays, they are length-checked, and can have different types inside them.
export type Float2 = [number, number]
export type Float3 = [number, number, number]
export type TestTuple = [number, string, boolean]

// A discriminating string union becomes an `enum` in C++.
// This one is string-backed.
export type Powertrain = 'electric' | 'gas' | 'hybrid'

// A classic TypeScript enum also becomes an `enum` in C++.
// This one is number-backed.
export enum OldEnum {
  FIRST,
  SECOND,
  THIRD,
}

// A plain interface that does not inherit from `HybridObject` becomes a `struct` in C++.
// They can only have properties (get + set). No methods or native state.
export interface Car {
  year: number
  make: string
  model: string
  power: number
  powertrain: Powertrain
  driver?: Person
  isFast?: boolean
}

// A `type T = { ... }` declaration is the same as a `interface T { ... }` - it's a `struct` in C++.
export type Person = {
  name: string
  age: number
}

// This is an `interface` we're going to use as a base in both of our `HybridObject`s later.
// In this case, the `HybridObject`s will just flatten out and copy over all properties here.
// There is no separate type for `SharedTestObjectProps` on the native side.
interface SharedTestObjectProps {
  // Test Primitives
  numberValue: number
  boolValue: boolean
  stringValue: string
  bigintValue: bigint
  stringOrUndefined: string | undefined
  stringOrNull: string | null
  optionalString?: string
  optionalArray?: string[]
  optionalEnum?: Powertrain
  optionalOldEnum?: OldEnum

  // Basic function tests
  simpleFunc(): void
  addNumbers(a: number, b: number): number
  addStrings(a: string, b: string): string
  multipleArguments(num: number, str: string, boo: boolean): void

  // Arrays
  bounceStrings(array: string[]): string[]
  bounceNumbers(array: number[]): number[]
  bounceStructs(array: Person[]): Person[]
  bounceEnums(array: Powertrain[]): Powertrain[]
  complexEnumCallback(
    array: Powertrain[],
    callback: (array: Powertrain[]) => void
  ): void

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
  promiseThrows(): Promise<void>

  // Complex Promises
  awaitAndGetPromise(promise: Promise<number>): Promise<number>
  awaitAndGetComplexPromise(promise: Promise<Car>): Promise<Car>
  awaitPromise(promise: Promise<void>): Promise<void>

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
  createArrayBufferAsync(): Promise<ArrayBuffer>

  // Inheritance
  createChild(): Child
  createBase(): Base
  createBaseActualChild(): Base
  bounceChild(child: Child): Child
  bounceBase(base: Base): Base
  bounceChildBase(child: Child): Base
  castBase(base: Base): Child
}

// This is a C++-based `HybridObject`.
// Since it inherited from the `SharedTestObjectProps` interface,
// it will be flattened out and every property/method will be added here.
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
  optionalHybrid?: TestObjectCpp
}

// This is a Swift/Kotlin-based `HybridObject`.
// Since it inherited from the `SharedTestObjectProps` interface,
// it will be flattened out and every property/method will be added here.
export interface TestObjectSwiftKotlin
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }>,
    SharedTestObjectProps {
  // Other HybridObjects
  readonly thisObject: TestObjectSwiftKotlin
  newTestObject(): TestObjectSwiftKotlin
  optionalHybrid?: TestObjectSwiftKotlin
}

// This is a simple `HybridObject` with just one value.
export interface Base
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  readonly baseValue: number
}

// This is a `HybridObject` that actually inherits from a different `HybridObject`.
// This will set up an inheritance chain on the native side.
// The native `Child` Swift/Kotlin class will inherit from the `Base` Swift/Kotlin class.
export interface Child extends Base {
  readonly childValue: number
}
