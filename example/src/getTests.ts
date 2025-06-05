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
import {
  getHybridObjectConstructor,
  NitroModules,
} from 'react-native-nitro-modules'
import { InteractionManager } from 'react-native'

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
  isFast: true,
}
const TEST_MAP: Record<string, number | boolean> = {
  someKey: 55,
  some_other_key: 123,
  a_bool: true,
  another_bool: false,
}
const TEST_MAP_2: Record<string, string> = {
  'someKey': 'someValue',
  'anotherKey': 'another-value',
  'third-key': 'thirdValue',
}

const BASE_DATE = new Date()
const DATE_PLUS_1H = (() => {
  const current = BASE_DATE.getTime()
  const oneHourInMilliseconds = 1000 * 60 * 60
  return new Date(current + oneHourInMilliseconds)
})()

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
  run: (complete: (value: T) => void) => void | Promise<void>,
  timeout: number = 1500
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    let didResolve = false
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        setImmediate(() => {
          setTimeout(() => {
            if (!didResolve) reject(new Error(`Timeouted!`))
          }, timeout)
        })
      })
    })
    try {
      await run((value) => {
        if (didResolve) {
          throw new Error(`Promise was already rejected!`)
        }
        didResolve = true
        resolve(value)
      })
    } catch (e) {
      didResolve = true
      reject(e)
    }
  })
}

export function getTests(
  testObject: TestObjectCpp | TestObjectSwiftKotlin
): TestRunner[] {
  return [
    createTest(
      'Async Promise resolution does does not cause a garbage-collection crash',
      async () =>
        // This test demonstrates a crashing bug seen in Nitro modules 0.25.2, only on
        // Android (Kotlin). Run this test individually (not in "Run All Tests") after a
        // fresh launch of NitroExample app for best repeatability of the crash. If
        // repeated runs of this test do not reproduce a crash, you may need to increase
        // memory use (or decrease available memory) to encourage garbage collection.

        // The crash logs this message:
        // "terminating due to uncaught exception of type std::runtime_error: Unable to retrieve jni environment. Is the thread attached?"
        // from the "hades" thread, which is used for garbage collection in the Hermes JS
        // engine. The crash results from execution of the C++ Promise destructor on a thread
        // that's not attached to the JVM. The origin is noted in the native backtrace as:
        // "(margelo::nitro::Promise<double>::~Promise()+96)"

        (
          await it(async () => {
            return timeoutedPromise(async (complete) => {
              // This section creates a Nitro Promise that resolves asynchronously. The crash
              // seen on Android/Kotlin in Nitro modules 0.25.2 requires that this is resolved
              // after a delay, and that garbage collection happens after it is resolved.
              const asyncPromise = testObject.callbackAsyncPromise(
                () =>
                  new Promise((resolve) =>
                    setTimeout(() => {
                      resolve(13)
                    }, 1_000)
                  )
              )

              // This section only exists to exercise the JS garbage collector, by creating
              // large strings that temporarily consume enough memory to trigger GC. Values
              // can be adjusted to increase memory use.
              const garbage: Array<string> = []
              let countdown = 200
              let resolveGarbagePromise = () => {}
              const garbagePromise = new Promise<void>((resolve) => {
                resolveGarbagePromise = resolve
              })
              let interval = setInterval(() => {
                if (countdown-- > 0) {
                  if (countdown % 10 === 0) {
                    garbage.length = 0
                  } else {
                    garbage.push('x'.repeat(2_000_000))
                  }
                } else {
                  clearInterval(interval)
                  resolveGarbagePromise()
                }
              }, 50)

              // This section waits on the async things to complete before passing the test.
              // As of Nitro modules 0.25.2, this test should succeed for Swift and C++, and
              // and it should frequently crash the Android app for Kotlin.
              const result = await asyncPromise
              await garbagePromise
              complete(result)
            }, 20_000)
          })
        )
          .didNotThrow()
          .equals(13)
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
          isFast: true,
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
          isFast: true,
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
          isFast: true,
        })
      )
        .didNotThrow()
        .equals({ age: 24, name: 'marc' })
    ),
    createTest('jsStyleObjectAsParameters()', async () =>
      (
        await it(() =>
          timeoutedPromise<number>((complete) => {
            testObject.jsStyleObjectAsParameters({
              value: 55,
              onChanged: (num) => complete(num),
            })
          })
        )
      )
        .didNotThrow()
        .didReturn('number')
        .equals(55)
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
    createTest('createArrayBuffer()', async () =>
      (await it(() => testObject.createArrayBufferAsync()))
        .didNotThrow()
        .didReturn('object')
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
        if (__DEV__) {
          const child = testObject.createBase()
          // @ts-expect-error
          testObject.bounceChild(child)
        } else {
          // This only throws in __DEV__ - in release it is optimized away and would crash. :)
          throw new Error(
            `This only throws in __DEV__ - in release it is optimized away and would crash. :)`
          )
        }
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
    createTest('callbackSync(() => number) returns same number', () =>
      it(() => {
        return testObject.callbackSync(() => 55)
      })
        .didNotThrow()
        .equals(55)
    ),
    createTest('new T() works', () =>
      it(() => {
        const HybridTestObjectCpp =
          getHybridObjectConstructor<TestObjectCpp>('TestObjectCpp')
        const instance = new HybridTestObjectCpp()
        return instance
      })
        .didNotThrow()
        .toContain('boolValue')
    ),
    createTest('new T() instanceof works', () =>
      it(() => {
        const HybridTestObjectCpp =
          getHybridObjectConstructor<TestObjectCpp>('TestObjectCpp')
        const instance = new HybridTestObjectCpp()
        return instance instanceof HybridTestObjectCpp
      })
        .didNotThrow()
        .equals(true)
    ),
    createTest('{} instanceof works', () =>
      it(() => {
        const HybridTestObjectCpp =
          getHybridObjectConstructor<TestObjectCpp>('TestObjectCpp')
        return {} instanceof HybridTestObjectCpp
      })
        .didNotThrow()
        .equals(false)
    ),
    createTest('new T() =/= new T()', () =>
      it(() => {
        const HybridTestObjectCpp =
          getHybridObjectConstructor<TestObjectCpp>('TestObjectCpp')
        const a = new HybridTestObjectCpp()
        const b = new HybridTestObjectCpp()
        return a === b
      })
        .didNotThrow()
        .equals(false)
    ),
    createTest('new T() a == a', () =>
      it(() => {
        const HybridTestObjectCpp =
          getHybridObjectConstructor<TestObjectCpp>('TestObjectCpp')
        const a = new HybridTestObjectCpp()
        // eslint-disable-next-line no-self-compare
        return a === a
      })
        .didNotThrow()
        .equals(true)
    ),
    createTest('NitroModules.updateMemorySize(obj) works (roundtrip)', () =>
      it(() => {
        NitroModules.updateMemorySize(testObject)
      }).didNotThrow()
    ),
    createTest('NitroModules.buildType holds a string', () =>
      it(() => {
        return NitroModules.buildType
      })
        .didNotThrow()
        .didReturn('string')
    ),
    createTest('NitroModules.version holds a string', () =>
      it(() => {
        return NitroModules.version
      })
        .didNotThrow()
        .didReturn('string')
    ),
    createTest('NitroModules.getAllHybridObjectNames() returns an array', () =>
      it(() => {
        return NitroModules.getAllHybridObjectNames()
      })
        .didNotThrow()
        .toBeArray()
    ),
    createTest('NitroModules.box(testObject) returns an object', () =>
      it(() => {
        return NitroModules.box(testObject)
      })
        .didNotThrow()
        .didReturn('object')
    ),
    createTest(
      'NitroModules.box(testObject).unbox() returns the same object',
      () =>
        it(() => {
          const boxed = NitroModules.box(testObject)
          const original = boxed.unbox()
          return original === testObject
        })
          .didNotThrow()
          .equals(true)
    ),
    createTest('NitroModules.hasHybridObject(testObject.name) to be true', () =>
      it(() => {
        return NitroModules.hasHybridObject(testObject.name)
      })
        .didNotThrow()
        .equals(true)
    ),
    createTest('NitroModules.hasNativeState(testObject) to be true', () =>
      it(() => {
        return NitroModules.hasNativeState(testObject)
      })
        .didNotThrow()
        .equals(true)
    ),
  ]
}
