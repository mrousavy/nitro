import {
  type HybridObject,
  type AnyMap,
  type Sync,
} from 'react-native-nitro-modules'
import type { TestView } from './TestView.nitro'

// Tuples become `std::tuple<...>` in C++.
// In contrast to arrays, they are length-checked, and can have different types inside them.
export type Float2 = [number, number]
export type Float3 = [number, number, number]
export type TestTuple = [number, string, boolean]

// Variants can have aliases/names
export type NamedVariant = string | Car

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

interface JsStyleStruct {
  value: number
  onChanged: (num: number) => void
}

interface MapWrapper {
  map: Record<string, string>
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
  optionalCallback?: (value: number) => void

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
  getMapKeys(map: AnyMap): string[]

  // Typed Maps (records)
  bounceMap(
    map: Record<string, number | boolean>
  ): Record<string, number | boolean>
  extractMap(mapWrapper: MapWrapper): MapWrapper['map']

  // Errors
  funcThatThrows(): number
  funcThatThrowsBeforePromise(): Promise<void>
  throwError(error: Error): void

  // Optional parameters
  tryOptionalParams(num: number, boo: boolean, str?: string): string
  tryMiddleParam(num: number, boo: boolean | undefined, str: string): string
  tryOptionalEnum(value?: Powertrain): Powertrain | undefined

  // Variants
  someVariant: number | string

  // Dates
  add1Hour(date: Date): Date
  currentDate(): Date

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
  callSumUpNTimes(callback: () => number, n: number): Promise<number>
  callbackAsyncPromise(callback: () => Promise<number>): Promise<number>
  callbackAsyncPromiseBuffer(
    callback: () => Promise<ArrayBuffer>
  ): Promise<ArrayBuffer>
  getComplexCallback(): (value: number) => void

  // Callbacks that return values
  getValueFromJSCallbackAndWait(getValue: () => number): Promise<number>
  getValueFromJsCallback(
    callback: () => string,
    andThenCall: (valueFromJs: string) => void
  ): Promise<void>

  // Objects
  getCar(): Car
  isCarElectric(car: Car): boolean
  getDriver(car: Car): Person | undefined
  jsStyleObjectAsParameters(params: JsStyleStruct): void

  // ArrayBuffers
  createArrayBuffer(): ArrayBuffer
  createArrayBufferFromNativeBuffer(copy: boolean): ArrayBuffer
  copyBuffer(buffer: ArrayBuffer): ArrayBuffer
  getBufferLastItem(buffer: ArrayBuffer): number
  setAllValuesTo(buffer: ArrayBuffer, value: number): void
  createArrayBufferAsync(): Promise<ArrayBuffer>
  bounceArrayBuffer(buffer: ArrayBuffer): ArrayBuffer

  // Complex variants
  passVariant(
    either: number | string | number[] | string[] | boolean
  ): number | string
  getVariantEnum(variant: OldEnum | boolean): OldEnum | boolean
  getVariantObjects(variant: Person | Car): Person | Car
  passNamedVariant(variant: NamedVariant): NamedVariant

  // Inheritance
  createChild(): Child
  createBase(): Base
  createBaseActualChild(): Base
  bounceChild(child: Child): Child
  bounceBase(base: Base): Base
  bounceChildBase(child: Child): Base
  castBase(base: Base): Child

  // Sync funcs
  callbackSync(callback: Sync<() => number>): number

  // Views
  getIsViewBlue(view: TestView): boolean
}

// This is a C++-based `HybridObject`.
// Since it inherited from the `SharedTestObjectProps` interface,
// it will be flattened out and every property/method will be added here.
export interface TestObjectCpp
  extends HybridObject<{ ios: 'c++' }>,
    SharedTestObjectProps {
  // Complex Variants + Tuples
  getVariantTuple(variant: Float2 | Float3): Float2 | Float3

  // Tuples
  someTuple: [number, string]
  flip(tuple: Float3): Float3
  passTuple(tuple: TestTuple): [number, string, boolean]

  // Type-specifics
  readonly thisObject: TestObjectCpp
  newTestObject(): TestObjectCpp
  optionalHybrid?: TestObjectCpp
  getVariantHybrid(variant: TestObjectCpp | Person): TestObjectCpp | Person
}

// This is a Swift/Kotlin-based `HybridObject`.
// Since it inherited from the `SharedTestObjectProps` interface,
// it will be flattened out and every property/method will be added here.
export interface TestObjectSwiftKotlin
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }>,
    SharedTestObjectProps {
  // Type-specifics
  readonly thisObject: TestObjectSwiftKotlin
  newTestObject(): TestObjectSwiftKotlin
  optionalHybrid?: TestObjectSwiftKotlin
  getVariantHybrid(
    variant: TestObjectSwiftKotlin | Person
  ): TestObjectSwiftKotlin | Person
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
