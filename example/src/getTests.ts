import {
  type TestObjectCpp,
  type TestObjectSwiftKotlin,
  OldEnum,
  type Car,
  type Person,
  type Powertrain,
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

export function getTests(
  testObject: TestObjectCpp | TestObjectSwiftKotlin
): TestRunner[] {
  return [
    // Basic prototype tests
    createTest('HybridObject.prototype is valid', () =>
      it(() => Object.getPrototypeOf(testObject))
        .didNotThrow()
        .didReturn('object')
        .toContain('simpleFunc')
    ),
    createTest('HybridObject.prototype.prototype is valid', () =>
      it(() => Object.getPrototypeOf(Object.getPrototypeOf(testObject)))
        .didNotThrow()
        .didReturn('object')
        .toContain('toString')
        .toContain('equals')
    ),
    createTest('Two HybridObjects are not equal (a == b)', () =>
      it(
        () =>
          // eslint-disable-next-line no-self-compare
          testObject.newTestObject() === testObject.newTestObject()
      )
        .didNotThrow()
        .equals(false)
    ),
    createTest('Two HybridObjects are not equal (a.equals(b))', () =>
      it(() => testObject.newTestObject().equals(testObject.newTestObject()))
        .didNotThrow()
        .equals(false)
    ),
    createTest("Two HybridObjects's prototypse are equal", () =>
      it(() => {
        const objA = testObject.newTestObject()
        const objB = testObject.newTestObject()
        return Object.getPrototypeOf(objA) === Object.getPrototypeOf(objB)
      })
        .didNotThrow()
        .equals(true)
    ),

    // Test Primitives (getters & setters)
    createTest('set numberValue to 13', () =>
      it(() => (testObject.numberValue = 13)).didNotThrow()
    ),
    createTest('get numberValue (== 13)', () =>
      it(() => {
        testObject.numberValue = 14
        return testObject.numberValue
      })
        .didNotThrow()
        .equals(14)
    ),
    createTest('set boolValue to true', () =>
      it(() => (testObject.boolValue = true)).didNotThrow()
    ),
    createTest('get boolValue (== true)', () =>
      it(() => {
        testObject.boolValue = true
        return testObject.boolValue
      })
        .didNotThrow()
        .equals(true)
    ),
    createTest("set stringValue to 'hello!'", () =>
      it(() => (testObject.stringValue = 'hello!')).didNotThrow()
    ),
    createTest("get stringValue (== 'hello!')", () =>
      it(() => {
        testObject.stringValue = 'hello!'
        return testObject.stringValue
      })
        .didNotThrow()
        .equals('hello!')
    ),
    createTest('set bigintValue to 7362572367826385n', () =>
      it(() => (testObject.bigintValue = 7362572367826385n)).didNotThrow()
    ),
    createTest('get bigintValue (== 7362572367826385n)', () =>
      it(() => {
        testObject.bigintValue = 7362572367826385n
        return testObject.bigintValue
      })
        .didNotThrow()
        .equals(7362572367826385n)
    ),
    createTest('set stringOrUndefined to string, then undefined', () =>
      it(() => {
        testObject.stringOrUndefined = 'hello'
        testObject.stringOrUndefined = undefined
      }).didNotThrow()
    ),
    createTest('get stringOrUndefined (== undefined)', () =>
      it(() => {
        testObject.stringOrUndefined = undefined
        return testObject.stringOrUndefined
      })
        .didNotThrow()
        .equals(undefined)
    ),
    createTest('set stringOrNull to string, then undefined', () =>
      it(() => {
        testObject.stringOrNull = 'hello'
        testObject.stringOrNull = null
      }).didNotThrow()
    ),
    createTest('get stringOrNull (== undefined)', () =>
      it(() => {
        testObject.stringOrNull = null
        return testObject.stringOrNull
      })
        .didNotThrow()
        .equals(null)
    ),
    createTest('set optionalString to string, then undefined', () =>
      it(() => {
        testObject.optionalString = 'hello'
        testObject.optionalString = undefined
      }).didNotThrow()
    ),
    createTest('get optionalString (== undefined)', () =>
      it(() => {
        testObject.optionalString = undefined
        return testObject.optionalString
      })
        .didNotThrow()
        .equals(undefined)
    ),

    // Test basic functions
    createTest('addNumbers(5, 13) = 18', () =>
      it(() => testObject.addNumbers(5, 13))
        .didNotThrow()
        .equals(18)
    ),
    createTest('addStrings("hello ", "world") = "hello world"', () =>
      it(() => testObject.addStrings('hello ', 'world'))
        .didNotThrow()
        .equals('hello world')
    ),
    createTest('simpleFunc()', () =>
      it(() => testObject.simpleFunc())
        .didNotThrow()
        .didReturn('undefined')
    ),
    createTest('multipleArguments(...)', () =>
      it(() => testObject.multipleArguments(13, 'hello!', true))
        .didNotThrow()
        .didReturn('undefined')
    ),

    // Arrays
    createTest('bounceNumbers(...) equals', () =>
      it(() => testObject.bounceNumbers([1, 2, 13, 42]))
        .didNotThrow()
        .didReturn('object')
        .equals([1, 2, 13, 42])
    ),
    createTest('bounceStrings(...) equals', () =>
      it(() => testObject.bounceStrings(['hello', 'world', '!']))
        .didNotThrow()
        .didReturn('object')
        .equals(['hello', 'world', '!'])
    ),
    createTest('bounceEnums(...) equals', () =>
      it(() => testObject.bounceEnums(['gas', 'hybrid']))
        .didNotThrow()
        .didReturn('object')
        .equals(['gas', 'hybrid'])
    ),
    createTest('bounceStructs(...) equals', () =>
      it(() =>
        testObject.bounceStructs([
          { age: 24, name: 'Marc' },
          { age: 5, name: 'Ben' },
        ])
      )
        .didNotThrow()
        .didReturn('object')
        .equals([
          { age: 24, name: 'Marc' },
          { age: 5, name: 'Ben' },
        ])
    ),

    createTest('complexEnumCallback(...)', async () =>
      (
        await it<Powertrain[]>(async () => {
          return timeoutedPromise((complete) => {
            testObject.complexEnumCallback(['gas', 'electric'], (result) => {
              complete(result)
            })
          })
        })
      )
        .didNotThrow()
        .equals(['gas', 'electric'])
    ),

    // Test Maps
    createTest('createMap()', () =>
      it(() => testObject.createMap())
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
      it(() => testObject.createMap().array)
        .didNotThrow()
        .didReturn('object')
        .equals([
          testObject.numberValue,
          testObject.boolValue,
          testObject.stringValue,
          testObject.bigintValue,
        ])
    ),
    createTest('createMap().object', () =>
      it(() => testObject.createMap().object)
        .didNotThrow()
        .didReturn('object')
        .equals({
          array: [
            testObject.numberValue,
            testObject.boolValue,
            testObject.stringValue,
            testObject.bigintValue,
            [
              testObject.numberValue,
              testObject.boolValue,
              testObject.stringValue,
              testObject.bigintValue,
            ],
          ],
          bigint: testObject.bigintValue,
          bool: testObject.boolValue,
          string: testObject.stringValue,
          number: testObject.numberValue,
          null: null,
        })
    ),
    createTest('mapRoundtrip(...)', () => {
      const map = testObject.createMap()
      return it(() => testObject.mapRoundtrip(map))
        .didNotThrow()
        .equals(map)
    }),

    // Test errors
    createTest('funcThatThrows()', () =>
      it(() => testObject.funcThatThrows()).didThrow()
    ),

    // Optional parameters
    createTest('tryOptionalParams(...) omitted', () =>
      it(() => testObject.tryOptionalParams(13, true))
        .didNotThrow()
        .didReturn('string')
        .equals('value omitted!')
    ),
    createTest('tryOptionalParams(...) provided', () =>
      it(() => testObject.tryOptionalParams(13, true, 'hello'))
        .didNotThrow()
        .didReturn('string')
        .equals('hello')
    ),
    createTest('tryOptionalParams(...) one-too-many', () =>
      it(() =>
        testObject.tryOptionalParams(
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
        testObject.tryOptionalParams(13)
      ).didThrow()
    ),
    createTest('tryMiddleParam(...)', () =>
      it(() => testObject.tryMiddleParam(13, undefined, 'hello!'))
        .didNotThrow()
        .equals('hello!')
    ),
    createTest('tryMiddleParam(...)', () =>
      it(() => testObject.tryMiddleParam(13, true, 'passed'))
        .didNotThrow()
        .equals('passed')
    ),
    createTest('tryOptionalEnum(...)', () =>
      it(() => testObject.tryOptionalEnum('gas'))
        .didNotThrow()
        .equals('gas')
    ),
    createTest('tryOptionalEnum(...)', () =>
      it(() => testObject.tryOptionalEnum(undefined))
        .didNotThrow()
        .equals(undefined)
    ),

    // Variants tests
    createTest('set someVariant to 55', () =>
      it(() => (testObject.someVariant = 55)).didNotThrow()
    ),
    createTest('get someVariant (== 55)', () =>
      it(() => {
        testObject.someVariant = 55
        return testObject.someVariant
      }).equals(55)
    ),
    createTest("set someVariant to 'some-string'", () =>
      it(() => (testObject.someVariant = 'some-string')).didNotThrow()
    ),
    createTest("get someVariant (== 'some-string')", () =>
      it(() => {
        testObject.someVariant = 'some-string'
        return testObject.someVariant
      }).equals('some-string')
    ),
    createTest('set someVariant to false', () =>
      it(
        () =>
          // @ts-expect-error
          (testObject.someVariant = false)
      ).didThrow()
    ),

    // More complex variants...
    ...('passVariant' in testObject
      ? [
          createTest('passVariant(...) holds something else ([1,2,3])', () =>
            it(() => testObject.passVariant([1, 2, 3]))
              .didNotThrow()
              .equals('holds something else!')
          ),
          createTest('passVariant(...) holds string(hello!)', () =>
            it(() => testObject.passVariant('hello!'))
              .didNotThrow()
              .equals('hello!')
          ),
          createTest('passVariant(...) holds number (5)', () =>
            it(() => testObject.passVariant(5))
              .didNotThrow()
              .equals(5)
          ),
          createTest('passVariant(...) wrong type ({})', () =>
            it(() =>
              testObject.passVariant(
                // @ts-expect-error
                {}
              )
            ).didThrow()
          ),
          // Complex variants tests
          createTest('getVariantEnum(...) converts enum', () =>
            it(() => testObject.getVariantEnum(OldEnum.THIRD))
              .didNotThrow()
              .equals(OldEnum.THIRD)
          ),
          createTest('getVariantEnum(...) converts boolean', () =>
            it(() => testObject.getVariantEnum(true))
              .didNotThrow()
              .equals(true)
          ),
          createTest('getVariantEnum(...) throws at wrong type (string)', () =>
            // @ts-expect-error
            it(() => testObject.getVariantEnum('string')).didThrow()
          ),
          createTest('getVariantObjects(...) converts Person', () =>
            it(() => testObject.getVariantObjects(TEST_PERSON))
              .didNotThrow()
              .equals(TEST_PERSON)
          ),
          createTest('getVariantObjects(...) converts Car', () =>
            it(() => testObject.getVariantObjects(TEST_CAR))
              .didNotThrow()
              .equals(TEST_CAR)
          ),
          createTest('getVariantObjects(...) converts Car (+ person)', () =>
            it(() =>
              testObject.getVariantObjects({ ...TEST_CAR, driver: TEST_PERSON })
            )
              .didNotThrow()
              .equals({ ...TEST_CAR, driver: TEST_PERSON })
          ),
          createTest(
            'getVariantObjects(...) throws at wrong type (string)',
            () =>
              // @ts-expect-error
              it(() => testObject.getVariantObjects('some-string')).didThrow()
          ),
          createTest(
            'getVariantObjects(...) throws at wrong type (wrong object)',
            () =>
              it(() =>
                // @ts-expect-error
                testObject.getVariantObjects({ someValue: 55 })
              ).didThrow()
          ),
          createTest('getVariantHybrid(...) converts Hybrid', () =>
            it(() => testObject.getVariantHybrid(testObject))
              .didNotThrow()
              // @ts-expect-error
              .toContain('getVariantHybrid')
          ),
          createTest('getVariantHybrid(...) converts Person', () =>
            it(() => testObject.getVariantHybrid(TEST_PERSON))
              .didNotThrow()
              .equals(TEST_PERSON)
          ),
          createTest(
            'getVariantHybrid(...) throws at wrong type (string)',
            () =>
              // @ts-expect-error
              it(() => testObject.getVariantHybrid('some-string')).didThrow()
          ),
          createTest(
            'getVariantHybrid(...) throws at wrong type (wrong object)',
            () =>
              it(() =>
                // @ts-expect-error
                testObject.getVariantHybrid({ someValue: 55 })
              ).didThrow()
          ),
          createTest('getVariantTuple(...) converts Float2', () =>
            it(() => testObject.getVariantTuple([10, 20]))
              .didNotThrow()
              .equals([10, 20])
          ),
          createTest('getVariantTuple(...) converts Float3', () =>
            it(() => testObject.getVariantTuple([10, 20, 30]))
              .didNotThrow()
              .equals([10, 20, 30])
          ),
          createTest(
            'getVariantTuple(...) throws at wrong size (4 items)',
            () =>
              it(() =>
                // @ts-expect-error
                testObject.getVariantTuple([10, 20, 30, 40, 50])
              ).didThrow()
          ),
          createTest('getVariantTuple(...) throws at wrong type (string)', () =>
            // @ts-expect-error
            it(() => testObject.getVariantTuple('hello')).didThrow()
          ),
          createTest(
            'getVariantTuple(...) throws at wrong type (string[])',
            () =>
              it(() =>
                // @ts-expect-error
                testObject.getVariantTuple(['hello', 'world'])
              ).didThrow()
          ),
        ]
      : [
          // Swift/Kotlin test object does not have variants yet.
        ]),

    // Tuples Tests
    ...('someTuple' in testObject
      ? [
          createTest("set someTuple to [55, 'hello']", () =>
            it(() => (testObject.someTuple = [55, 'hello'])).didNotThrow()
          ),
          createTest("get someTuple (== [55, 'hello'])", () =>
            it(() => {
              testObject.someTuple = [55, 'hello']
              return testObject.someTuple
            }).equals([55, 'hello'])
          ),
          createTest('flip([10, 20, 30])', () =>
            it(() => testObject.flip([10, 20, 30]))
              .didNotThrow()
              .equals([30, 20, 10])
          ),
          createTest('flip([10, 20]) throws', () =>
            it(() =>
              testObject.flip(
                // @ts-expect-error
                [10, 20]
              )
            ).didThrow()
          ),
          createTest('passTuple(...)', () =>
            it(() => testObject.passTuple([13, 'hello', true]))
              .didNotThrow()
              .equals([13, 'hello', true])
          ),
        ]
      : [
          // Swift/Kotlin Test Object does not have tuples yet!
        ]),

    // Promises
    createTest('wait', async () =>
      (await it(() => testObject.wait(0.1))).didNotThrow()
    ),
    createTest('calculateFibonacciSync(5)', async () =>
      it(() => testObject.calculateFibonacciSync(10))
        .didNotThrow()
        .equals(55n)
    ),
    createTest('calculateFibonacciAsync(5)', async () =>
      (await it(() => testObject.calculateFibonacciAsync(10)))
        .didNotThrow()
        .equals(55n)
    ),

    // Callbacks
    createTest('callCallback(...)', async () =>
      (
        await it<boolean>(async () => {
          return timeoutedPromise((complete) => {
            testObject.callCallback(() => {
              complete(true)
            })
          })
        })
      )
        .didNotThrow()
        .equals(true)
    ),
    createTest('callWithOptional(undefined)', async () =>
      (
        await it<number | undefined>(async () => {
          return timeoutedPromise((complete) => {
            testObject.callWithOptional(undefined, (val) => {
              complete(val)
            })
          })
        })
      )
        .didNotThrow()
        .equals(undefined)
    ),
    createTest('callWithOptional(433)', async () =>
      (
        await it<number | undefined>(async () => {
          return timeoutedPromise((complete) => {
            testObject.callWithOptional(433, (val) => {
              complete(val)
            })
          })
        })
      )
        .didNotThrow()
        .equals(433)
    ),
    ...('getValueFromJsCallback' in testObject
      ? [
          createTest('getValueFromJsCallback(...)', async () =>
            (
              await it(async () => {
                let value: string | undefined
                await testObject.getValueFromJsCallback(
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
          createTest('getValueFromJSCallbackAndWait(...)', async () =>
            (await it(() => testObject.getValueFromJSCallbackAndWait(() => 73)))
              .didNotThrow()
              .equals(73)
          ),
        ]
      : [
          // Swift/Kotlin Test Object does not support JS callbacks _that return a value_ yet!
        ]),
    createTest('callAll(...)', async () =>
      (
        await it(async () => {
          return timeoutedPromise((complete) => {
            let calledCount = 0
            const func = () => {
              calledCount++
              if (calledCount === 3) complete(calledCount)
            }
            testObject.callAll(func, func, func)
          })
        })
      )
        .didNotThrow()
        .equals(3)
    ),

    // Objects
    createTest('getCar()', () =>
      it(() => testObject.getCar())
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
        testObject.isCarElectric({
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
        testObject.getDriver({
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
        testObject.getDriver({
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
      it(() => testObject.thisObject)
        .didNotThrow()
        .didReturn('object')
        .toContain('bigintValue')
        .toContain('boolValue')
        .toContain('stringValue')
    ),
    createTest('newTestObject()', () =>
      it(() => testObject.newTestObject())
        .didNotThrow()
        .didReturn('object')
        .toContain('bigintValue')
        .toContain('boolValue')
        .toContain('stringValue')
    ),

    // ArrayBuffers
    createTest('createArrayBuffer()', () =>
      it(() => testObject.createArrayBuffer())
        .didNotThrow()
        .didReturn('object')
    ),
    createTest('getBufferLastItem(...) == 5', () =>
      it(() => {
        const buffer = new Uint8Array([13, 20, 55])
        return testObject.getBufferLastItem(buffer.buffer)
      })
        .didNotThrow()
        .equals(55)
    ),
    createTest('setAllValuesTo(...)', () =>
      it(() => {
        const buffer = new Uint8Array(30)
        testObject.setAllValuesTo(buffer.buffer, 55)
        return buffer.every((v) => v === 55)
      })
        .didNotThrow()
        .equals(true)
    ),

    // Base HybridObject inherited methods
    createTest('.toString()', () =>
      it(() => testObject.toString())
        .didNotThrow()
        .didReturn('string')
        .equals(`[HybridObject ${testObject.name}]`)
    ),
    createTest('.name', () =>
      it(() => testObject.name)
        .didNotThrow()
        .didReturn('string')
    ),
    createTest('.equals(...) == true', () =>
      it(() => testObject.equals(testObject))
        .didNotThrow()
        .equals(true)
    ),
    createTest('.equals(.self) == true', () =>
      it(() => testObject.equals(testObject.thisObject))
        .didNotThrow()
        .equals(true)
    ),
    createTest('.self == .self', () =>
      // eslint-disable-next-line no-self-compare
      it(() => testObject.thisObject === testObject.thisObject)
        .didNotThrow()
        .equals(true)
    ),
    createTest('.equals(newTestObject()) == false', () =>
      it(() => testObject.equals(testObject.newTestObject()))
        .didNotThrow()
        .equals(false)
    ),
    createTest('Object.keys(...)', () =>
      it(() => Object.keys(testObject))
        .didNotThrow()
        .didReturn('object')
        .toBeArray()
    ),
    ...('rawJsiFunc' in testObject
      ? [
          createTest('Call Raw JSI Func', () =>
            // @ts-expect-error
            it(() => testObject.rawJsiFunc(55, false, 'hello', { obj: true }))
              .didNotThrow()
              .equals([55, false, 'hello', { obj: true }])
          ),
        ]
      : [
          // Swift/Kotlin Test Objects don't have raw JSI functions!
        ]),

    createTest('createBase() works', () =>
      it(() => testObject.createBase())
        .didNotThrow()
        .didReturn('object')
        .toContain('baseValue')
    ),
    createTest('createChild() works', () =>
      it(() => testObject.createChild())
        .didNotThrow()
        .didReturn('object')
        .toContain('childValue')
        .toContain('baseValue')
    ),
    createTest('createBase() has name "Base"', () =>
      it(() => testObject.createBase().name)
        .didNotThrow()
        .equals('Base')
    ),
    createTest('createChild() has name "Child"', () =>
      it(() => testObject.createChild().name)
        .didNotThrow()
        .equals('Child')
    ),
    createTest('createBaseActualChild() has name "Child"', () =>
      it(() => testObject.createBaseActualChild().name)
        .didNotThrow()
        .equals('Child')
    ),
    createTest('createBaseActualChild() works', () =>
      it(() => testObject.createBaseActualChild())
        .didNotThrow()
        .didReturn('object')
        .toContain('baseValue')
    ),
    createTest('createBaseActualChild() is actually a child', () =>
      it(() => testObject.createBaseActualChild())
        .didNotThrow()
        .didReturn('object')
        // @ts-expect-error
        .toContain('childValue')
        .toContain('baseValue')
    ),
    createTest('bounceChild(Child) ===', () =>
      it(() => {
        const child = testObject.createChild()
        const bounced = testObject.bounceChild(child)
        return bounced === child
      })
        .didNotThrow()
        .equals(true)
    ),
    createTest('bounceBase(Base) ===', () =>
      it(() => {
        const base = testObject.createBase()
        const bounced = testObject.bounceBase(base)
        return bounced === base
      })
        .didNotThrow()
        .equals(true)
    ),
    createTest('bounceBase(Child) ===', () =>
      it(() => {
        const child = testObject.createChild()
        const bounced = testObject.bounceBase(child)
        return bounced === child
      })
        .didNotThrow()
        .equals(true)
    ),
    createTest('bounceChild(Base) throws', () =>
      it(() => {
        const child = testObject.createBase()
        // @ts-expect-error
        testObject.bounceChild(child)
      }).didThrow()
    ),
    createTest('bounceChildBase(Child) ===', () =>
      it(() => {
        const child = testObject.createChild()
        const bounced = testObject.bounceChildBase(child)
        return bounced === child
      })
        .didNotThrow()
        .equals(true)
    ),
    createTest('castBase(Child) works', () =>
      it(() => {
        const child = testObject.createChild()
        const bounced = testObject.castBase(child)
        return bounced === child
      })
        .didNotThrow()
        .equals(true)
    ),
  ]
}
