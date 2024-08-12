import {
  HybridTestObject,
  OldEnum,
  type Car,
  type Person,
} from 'react-native-nitro-image'
import type { State } from './Testers'
import { it } from './Testers'
import { stringify } from './utils'

type TestResult =
  | {
      status: 'successful'
      result: string
    }
  | {
      status: 'failed'
      message: string
    }

export interface TestRunner {
  name: string
  run: () => Promise<TestResult>
}

const TEST_PERSON: Person = {
  age: 24,
  name: 'Marc',
}
const TEST_CAR: Car = {
  year: 2018,
  make: 'Lamborghini',
  model: 'Huracan Performante',
  power: 640,
  powertrain: 'gas',
  driver: undefined, // <-- value needs to be explicitly set, to equal it with native's std::optional<..>
}

function createTest<T>(
  name: string,
  run: () => State<T> | Promise<State<T>>
): TestRunner {
  return {
    name: name,
    run: async (): Promise<TestResult> => {
      try {
        console.log(`⏳ Test "${name}" started...`)
        const state = await run()
        console.log(`✅ Test "${name}" passed!`)
        return {
          status: 'successful',
          result: stringify(state.result ?? state.errorThrown ?? '(void)'),
        }
      } catch (e) {
        console.log(`❌ Test "${name}" failed! ${e}`)
        return {
          status: 'failed',
          message: stringify(e),
        }
      }
    },
  }
}

function timeoutedPromise<T>(
  run: (complete: (value: T) => void) => void | Promise<void>
): Promise<T> {
  return new Promise((resolve, reject) => {
    let didResolve = false
    setTimeout(() => {
      if (!didResolve) reject(new Error(`Timeouted!`))
    }, 500)
    run((value) => {
      if (didResolve) {
        throw new Error(`Promise was already rejected!`)
      }
      didResolve = true
      resolve(value)
    })
  })
}

export function getTests(): TestRunner[] {
  return [
    // Basic prototype tests
    createTest('HybridObject.prototype is valid', () =>
      it(() => Object.getPrototypeOf(HybridTestObject))
        .didNotThrow()
        .didReturn('object')
        .toContain('simpleFunc')
    ),
    createTest('HybridObject.prototype.prototype is valid', () =>
      it(() => Object.getPrototypeOf(Object.getPrototypeOf(HybridTestObject)))
        .didNotThrow()
        .didReturn('object')
        .toContain('toString')
        .toContain('equals')
    ),
    createTest('Two HybridObjects are not equal (a == b)', () =>
      it(
        () =>
          // eslint-disable-next-line no-self-compare
          HybridTestObject.newTestObject() === HybridTestObject.newTestObject()
      )
        .didNotThrow()
        .equals(false)
    ),
    createTest('Two HybridObjects are not equal (a.equals(b))', () =>
      it(() =>
        HybridTestObject.newTestObject().equals(
          HybridTestObject.newTestObject()
        )
      )
        .didNotThrow()
        .equals(false)
    ),
    createTest("Two HybridObjects's prototypse are equal", () =>
      it(() => {
        const objA = HybridTestObject.newTestObject()
        const objB = HybridTestObject.newTestObject()
        return Object.getPrototypeOf(objA) === Object.getPrototypeOf(objB)
      })
        .didNotThrow()
        .equals(true)
    ),

    // Test Primitives (getters & setters)
    createTest('set numberValue to 13', () =>
      it(() => (HybridTestObject.numberValue = 13)).didNotThrow()
    ),
    createTest('get numberValue (== 13)', () =>
      it(() => HybridTestObject.numberValue)
        .didNotThrow()
        .equals(13)
    ),
    createTest('set boolValue to true', () =>
      it(() => (HybridTestObject.boolValue = true)).didNotThrow()
    ),
    createTest('get boolValue (== true)', () =>
      it(() => HybridTestObject.boolValue)
        .didNotThrow()
        .equals(true)
    ),
    createTest("set stringValue to 'hello!'", () =>
      it(() => (HybridTestObject.stringValue = 'hello!')).didNotThrow()
    ),
    createTest("get stringValue (== 'hello!')", () =>
      it(() => HybridTestObject.stringValue)
        .didNotThrow()
        .equals('hello!')
    ),
    createTest('set bigintValue to 7362572367826385n', () =>
      it(() => (HybridTestObject.bigintValue = 7362572367826385n)).didNotThrow()
    ),
    createTest('get bigintValue (== 7362572367826385n)', () =>
      it(() => HybridTestObject.bigintValue)
        .didNotThrow()
        .equals(7362572367826385n)
    ),
    createTest('set stringOrUndefined to string, then undefined', () =>
      it(() => {
        HybridTestObject.stringOrUndefined = 'hello'
        HybridTestObject.stringOrUndefined = undefined
      }).didNotThrow()
    ),
    createTest('get stringOrUndefined (== undefined)', () =>
      it(() => HybridTestObject.stringOrUndefined)
        .didNotThrow()
        .equals(undefined)
    ),
    createTest('set stringOrNull to string, then undefined', () =>
      it(() => {
        HybridTestObject.stringOrNull = 'hello'
        HybridTestObject.stringOrNull = null
      }).didNotThrow()
    ),
    createTest('get stringOrNull (== undefined)', () =>
      it(() => HybridTestObject.stringOrNull)
        .didNotThrow()
        .equals(null)
    ),
    createTest('set optionalString to string, then undefined', () =>
      it(() => {
        HybridTestObject.optionalString = 'hello'
        HybridTestObject.optionalString = undefined
      }).didNotThrow()
    ),
    createTest('get optionalString (== undefined)', () =>
      it(() => HybridTestObject.optionalString)
        .didNotThrow()
        .equals(undefined)
    ),

    // Test basic functions
    createTest('addNumbers(5, 13) = 18', () =>
      it(() => HybridTestObject.addNumbers(5, 13))
        .didNotThrow()
        .equals(18)
    ),
    createTest('addStrings("hello ", "world") = "hello world"', () =>
      it(() => HybridTestObject.addStrings('hello ', 'world'))
        .didNotThrow()
        .equals('hello world')
    ),
    createTest('simpleFunc()', () =>
      it(() => HybridTestObject.simpleFunc())
        .didNotThrow()
        .didReturn('undefined')
    ),
    createTest('multipleArguments(...)', () =>
      it(() => HybridTestObject.multipleArguments(13, 'hello!', true))
        .didNotThrow()
        .didReturn('undefined')
    ),

    // Test Maps
    createTest('createMap()', () =>
      it(() => HybridTestObject.createMap())
        .didNotThrow()
        .didReturn('object')
        .toContain('object')
        .toContain('array')
        .toContain('null')
        .toContain('bigint')
        .toContain('string')
        .toContain('bool')
        .toContain('number')
    ),
    createTest('createMap().array', () =>
      it(() => HybridTestObject.createMap().array)
        .didNotThrow()
        .didReturn('object')
    ),
    createTest('createMap().object', () =>
      it(() => HybridTestObject.createMap().object)
        .didNotThrow()
        .didReturn('object')
    ),
    createTest('mapRoundtrip(...)', () =>
      it(() => HybridTestObject.mapRoundtrip(HybridTestObject.createMap()))
        .didNotThrow()
        .equals(HybridTestObject.createMap())
    ),

    // Test Arrays
    createTest('createNumbers(...)', () =>
      it(() => HybridTestObject.createNumbers())
        .didNotThrow()
        .toBeArray()
        .equals([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
    ),
    createTest('createStrings(...)', () =>
      it(() => HybridTestObject.createStrings())
        .didNotThrow()
        .toBeArray()
        .equals(['h', 'e', 'll', 'o'])
    ),
    createTest('combineArrays(...)', () =>
      it(() =>
        HybridTestObject.combineArrays([10, 20, 30], ['h', 'e', 'll', 'o'])
      )
        .didNotThrow()
        .toBeArray()
        .equals([10, 20, 30, 'h', 'e', 'll', 'o'])
    ),

    // Test errors
    createTest('get valueThatWillThrowOnAccess', () =>
      it(() => HybridTestObject.valueThatWillThrowOnAccess).didThrow()
    ),
    createTest('set valueThatWillThrowOnAccess', () =>
      it(() => (HybridTestObject.valueThatWillThrowOnAccess = 55)).didThrow()
    ),
    createTest('funcThatThrows()', () =>
      it(() => HybridTestObject.funcThatThrows()).didThrow()
    ),

    // Optional parameters
    createTest('tryOptionalParams(...) omitted', () =>
      it(() => HybridTestObject.tryOptionalParams(13, true))
        .didNotThrow()
        .didReturn('string')
        .equals('value omitted!')
    ),
    createTest('tryOptionalParams(...) provided', () =>
      it(() => HybridTestObject.tryOptionalParams(13, true, 'hello'))
        .didNotThrow()
        .didReturn('string')
        .equals('hello')
    ),
    createTest('tryOptionalParams(...) one-too-many', () =>
      it(() =>
        HybridTestObject.tryOptionalParams(
          13,
          true,
          'hello',
          // @ts-expect-error
          'too many args!'
        )
      ).didThrow()
    ),
    createTest('tryOptionalParams(...) one-too-few', () =>
      it(() =>
        // @ts-expect-error
        HybridTestObject.tryOptionalParams(13)
      ).didThrow()
    ),
    createTest('tryMiddleParam(...)', () =>
      it(() => HybridTestObject.tryMiddleParam(13, undefined, 'hello!'))
        .didNotThrow()
        .equals('hello!')
    ),
    createTest('tryMiddleParam(...)', () =>
      it(() => HybridTestObject.tryMiddleParam(13, true, 'passed'))
        .didNotThrow()
        .equals('passed')
    ),

    // Variants tests
    createTest('set someVariant to 55', () =>
      it(() => (HybridTestObject.someVariant = 55)).didNotThrow()
    ),
    createTest('get someVariant (== 55)', () =>
      it(() => HybridTestObject.someVariant).equals(55)
    ),
    createTest("set someVariant to 'some-string'", () =>
      it(() => (HybridTestObject.someVariant = 'some-string')).didNotThrow()
    ),
    createTest("get someVariant (== 'some-string')", () =>
      it(() => HybridTestObject.someVariant).equals('some-string')
    ),
    createTest('set someVariant to false', () =>
      it(
        () =>
          // @ts-expect-error
          (HybridTestObject.someVariant = false)
      ).didThrow()
    ),
    createTest('passVariant(...) holds something else ([1,2,3])', () =>
      it(() => HybridTestObject.passVariant([1, 2, 3]))
        .didNotThrow()
        .equals('holds something else!')
    ),
    createTest('passVariant(...) holds string(hello!)', () =>
      it(() => HybridTestObject.passVariant('hello!'))
        .didNotThrow()
        .equals('hello!')
    ),
    createTest('passVariant(...) holds number (5)', () =>
      it(() => HybridTestObject.passVariant(5))
        .didNotThrow()
        .equals(5)
    ),
    createTest('passVariant(...) wrong type ({})', () =>
      it(() =>
        HybridTestObject.passVariant(
          // @ts-expect-error
          {}
        )
      ).didThrow()
    ),

    // Complex variants tests
    createTest('getVariantEnum(...) converts enum', () =>
      it(() => HybridTestObject.getVariantEnum(OldEnum.THIRD))
        .didNotThrow()
        .equals(OldEnum.THIRD)
    ),
    createTest('getVariantEnum(...) converts boolean', () =>
      it(() => HybridTestObject.getVariantEnum(true))
        .didNotThrow()
        .equals(true)
    ),
    createTest('getVariantEnum(...) throws at wrong type (string)', () =>
      // @ts-expect-error
      it(() => HybridTestObject.getVariantEnum('string')).didThrow()
    ),
    createTest('getVariantObjects(...) converts Person', () =>
      it(() => HybridTestObject.getVariantObjects(TEST_PERSON))
        .didNotThrow()
        .equals(TEST_PERSON)
    ),
    createTest('getVariantObjects(...) converts Car', () =>
      it(() => HybridTestObject.getVariantObjects(TEST_CAR))
        .didNotThrow()
        .equals(TEST_CAR)
    ),
    createTest('getVariantObjects(...) converts Car (+ person)', () =>
      it(() =>
        HybridTestObject.getVariantObjects({ ...TEST_CAR, driver: TEST_PERSON })
      )
        .didNotThrow()
        .equals({ ...TEST_CAR, driver: TEST_PERSON })
    ),
    createTest('getVariantObjects(...) throws at wrong type (string)', () =>
      // @ts-expect-error
      it(() => HybridTestObject.getVariantObjects('some-string')).didThrow()
    ),
    createTest(
      'getVariantObjects(...) throws at wrong type (wrong object)',
      () =>
        it(() =>
          // @ts-expect-error
          HybridTestObject.getVariantObjects({ someValue: 55 })
        ).didThrow()
    ),
    createTest('getVariantHybrid(...) converts Hybrid', () =>
      it(() => HybridTestObject.getVariantHybrid(HybridTestObject))
        .didNotThrow()
        // @ts-expect-error
        .toContain('getVariantHybrid')
    ),
    createTest('getVariantHybrid(...) converts Person', () =>
      it(() => HybridTestObject.getVariantHybrid(TEST_PERSON))
        .didNotThrow()
        .equals(TEST_PERSON)
    ),
    createTest('getVariantHybrid(...) throws at wrong type (string)', () =>
      // @ts-expect-error
      it(() => HybridTestObject.getVariantHybrid('some-string')).didThrow()
    ),
    createTest(
      'getVariantHybrid(...) throws at wrong type (wrong object)',
      () =>
        it(() =>
          // @ts-expect-error
          HybridTestObject.getVariantHybrid({ someValue: 55 })
        ).didThrow()
    ),
    createTest('getVariantTuple(...) converts Float2', () =>
      it(() => HybridTestObject.getVariantTuple([10, 20]))
        .didNotThrow()
        .equals([10, 20])
    ),
    createTest('getVariantTuple(...) converts Float3', () =>
      it(() => HybridTestObject.getVariantTuple([10, 20, 30]))
        .didNotThrow()
        .equals([10, 20, 30])
    ),
    createTest('getVariantTuple(...) throws at wrong size (4 items)', () =>
      it(() =>
        // @ts-expect-error
        HybridTestObject.getVariantTuple([10, 20, 30, 40, 50])
      ).didThrow()
    ),
    createTest('getVariantTuple(...) throws at wrong type (string)', () =>
      // @ts-expect-error
      it(() => HybridTestObject.getVariantTuple('hello')).didThrow()
    ),
    createTest('getVariantTuple(...) throws at wrong type (string[])', () =>
      // @ts-expect-error
      it(() => HybridTestObject.getVariantTuple(['hello', 'world'])).didThrow()
    ),

    // Tuples Tests
    createTest("set someTuple to [55, 'hello']", () =>
      it(() => (HybridTestObject.someTuple = [55, 'hello'])).didNotThrow()
    ),
    createTest("get someTuple (== [55, 'hello'])", () =>
      it(() => HybridTestObject.someTuple).equals([55, 'hello'])
    ),
    createTest('flip([10, 20, 30])', () =>
      it(() => HybridTestObject.flip([10, 20, 30]))
        .didNotThrow()
        .equals([30, 20, 10])
    ),
    createTest('flip([10, 20]) throws', () =>
      it(() =>
        HybridTestObject.flip(
          // @ts-expect-error
          [10, 20]
        )
      ).didThrow()
    ),
    createTest('passTuple(...)', () =>
      it(() => HybridTestObject.passTuple([13, 'hello', true]))
        .didNotThrow()
        .equals([13, 'hello', true])
    ),

    // Promises
    createTest('wait', async () =>
      (await it(() => HybridTestObject.wait(0.1))).didNotThrow()
    ),
    createTest('calculateFibonacciSync(5)', async () =>
      it(() => HybridTestObject.calculateFibonacciSync(10))
        .didNotThrow()
        .equals(55n)
    ),
    createTest('calculateFibonacciAsync(5)', async () =>
      (await it(() => HybridTestObject.calculateFibonacciAsync(10)))
        .didNotThrow()
        .equals(55n)
    ),

    // Callbacks
    createTest('callCallback(...)', async () =>
      (
        await it<boolean>(async () => {
          return timeoutedPromise((complete) => {
            HybridTestObject.callCallback(() => {
              complete(true)
            })
          })
        })
      )
        .didNotThrow()
        .equals(true)
    ),
    createTest('getValueFromJSCallback(...)', async () =>
      (
        await it(async () => {
          return timeoutedPromise((complete) => {
            HybridTestObject.getValueFromJSCallback(() => {
              complete(true)
              return 55
            })
          })
        })
      )
        .didNotThrow()
        .equals(true)
    ),
    createTest('getValueFromJSCallbackAndWait(...)', async () =>
      (await it(() => HybridTestObject.getValueFromJSCallbackAndWait(() => 73)))
        .didNotThrow()
        .equals(73)
    ),
    createTest('callAll(...)', async () =>
      (
        await it(async () => {
          return timeoutedPromise((complete) => {
            let calledCount = 0
            const func = () => {
              calledCount++
              if (calledCount === 3) complete(calledCount)
            }
            HybridTestObject.callAll(func, func, func)
          })
        })
      )
        .didNotThrow()
        .equals(3)
    ),
    createTest('getValueFromJsCallback(...)', async () =>
      (
        await it(async () => {
          let value: string | undefined
          await HybridTestObject.getValueFromJsCallback(
            () => 'hello',
            (val) => {
              value = val
            }
          )
          return value
        })
      )
        .didNotThrow()
        .equals('hello')
    ),

    // Objects
    createTest('getCar()', () =>
      it(() => HybridTestObject.getCar())
        .didNotThrow()
        .didReturn('object')
        .toContain('year')
        .toContain('make')
        .toContain('model')
        .toContain('power')
        .toContain('powertrain')
        .toContain('driver')
    ),
    createTest('isCarElectric(...)', () =>
      it(() =>
        HybridTestObject.isCarElectric({
          make: 'Lamborghini',
          year: 2018,
          model: 'Huracan Performante',
          power: 640,
          powertrain: 'gas',
        })
      )
        .didNotThrow()
        .equals(false)
    ),
    createTest('getDriver(...) with no driver', () =>
      it(() =>
        HybridTestObject.getDriver({
          make: 'Lamborghini',
          year: 2018,
          model: 'Huracan Performante',
          power: 640,
          powertrain: 'gas',
        })
      )
        .didNotThrow()
        .equals(undefined)
    ),
    createTest('getDriver(...) with driver', () =>
      it(() =>
        HybridTestObject.getDriver({
          make: 'Lamborghini',
          year: 2018,
          model: 'Huracan Performante',
          power: 640,
          powertrain: 'gas',
          driver: { age: 24, name: 'marc' },
        })
      )
        .didNotThrow()
        .equals({ age: 24, name: 'marc' })
    ),

    // Hybrid Object Tests
    createTest('get self', () =>
      it(() => HybridTestObject.self)
        .didNotThrow()
        .didReturn('object')
        .toContain('bigintValue')
        .toContain('boolValue')
        .toContain('stringValue')
    ),
    createTest('newTestObject()', () =>
      it(() => HybridTestObject.newTestObject())
        .didNotThrow()
        .didReturn('object')
        .toContain('bigintValue')
        .toContain('boolValue')
        .toContain('stringValue')
    ),

    // ArrayBuffers
    createTest('createArrayBuffer()', () =>
      it(() => HybridTestObject.createArrayBuffer())
        .didNotThrow()
        .didReturn('object')
    ),
    createTest('getBufferLastItem(...) == 5', () =>
      it(() => {
        const buffer = new Uint8Array([13, 20, 55])
        return HybridTestObject.getBufferLastItem(buffer.buffer)
      })
        .didNotThrow()
        .equals(55)
    ),
    createTest('setAllValuesTo(...)', () =>
      it(() => {
        const buffer = new Uint8Array(30)
        HybridTestObject.setAllValuesTo(buffer.buffer, 55)
        return buffer.every((v) => v === 55)
      })
        .didNotThrow()
        .equals(true)
    ),

    // Base HybridObject inherited methods
    createTest('.toString()', () =>
      it(() => HybridTestObject.toString())
        .didNotThrow()
        .didReturn('string')
        .equals('[HybridObject TestObject]')
    ),
    createTest('.name', () =>
      it(() => HybridTestObject.name)
        .didNotThrow()
        .didReturn('string')
        .equals('TestObject')
    ),
    createTest('.equals(...) == true', () =>
      it(() => HybridTestObject.equals(HybridTestObject))
        .didNotThrow()
        .equals(true)
    ),
    createTest('.equals(.self) == true', () =>
      it(() => HybridTestObject.equals(HybridTestObject.self))
        .didNotThrow()
        .equals(true)
    ),
    createTest('.self == .self', () =>
      // eslint-disable-next-line no-self-compare
      it(() => HybridTestObject.self === HybridTestObject.self)
        .didNotThrow()
        .equals(true)
    ),
    createTest('.equals(newTestObject()) == false', () =>
      it(() => HybridTestObject.equals(HybridTestObject.newTestObject()))
        .didNotThrow()
        .equals(false)
    ),
    createTest('Object.keys(...)', () =>
      it(() => Object.keys(HybridTestObject))
        .didNotThrow()
        .didReturn('object')
        .toBeArray()
    ),
  ]
}
