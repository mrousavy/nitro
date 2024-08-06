import { HybridTestObject } from 'react-native-nitro-image'
import type { State } from './Testers'
import { it } from './Testers'

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

function stringify(value: unknown): string {
  if (value == null) {
    return 'null'
  }

  switch (typeof value) {
    case 'string':
      return value
    case 'bigint':
    case 'boolean':
    case 'number':
    case 'symbol':
      return String(value)
    case 'function':
      return value.toString()
    case 'object':
      if (value instanceof Error) {
        return `${value.name}: ${value.message}`
      }
      if ('toString' in value) {
        const string = value.toString()
        if (string !== '[object Object]') return string
      }
      return `{ ${value} ${Object.keys(value).join(', ')} }`
    default:
      return `${value}`
  }
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

export function getTests(): TestRunner[] {
  return [
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
    createTest('passVariant(...) [1,2,3]', () =>
      it(() => HybridTestObject.passVariant([1, 2, 3]))
        .didNotThrow()
        .equals('omitted')
    ),
    createTest('passVariant(...) hello!', () =>
      it(() => HybridTestObject.passVariant('hello!'))
        .didNotThrow()
        .equals('hello!')
    ),
    createTest('passVariant(...) wrong type ({})', () =>
      it(() =>
        HybridTestObject.passVariant(
          // @ts-expect-error
          {}
        )
      ).didThrow()
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
      (await it(() => HybridTestObject.wait(0.5))).didNotThrow()
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
        await it(async () => {
          let wasCalled = false
          HybridTestObject.callCallback(() => {
            wasCalled = true
          })
          await HybridTestObject.wait(0.5) // <-- we need to sleep cuz callbacks are executed asynchronously!
          return wasCalled
        })
      )
        .didNotThrow()
        .equals(true)
    ),
    createTest('getValueFromJSCallback(...)', async () =>
      (
        await it(async () => {
          let wasCalled = false
          HybridTestObject.getValueFromJSCallback(() => {
            wasCalled = true
            return 55
          })
          await HybridTestObject.wait(0.5) // <-- we need to sleep cuz callbacks are executed asynchronously!
          return wasCalled
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
          let calledCount = 0
          HybridTestObject.callAll(
            () => {
              calledCount++
            },
            () => {
              calledCount++
            },
            () => {
              calledCount++
            }
          )
          await HybridTestObject.wait(0.5) // <-- we need to sleep cuz callbacks are executed asynchronously!
          return calledCount
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
