import { HybridTestObject } from 'react-native-nitro-image'
import type { State } from './Testers'
import safeStringify from 'fast-safe-stringify'
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
        const state = await run()
        return {
          status: 'successful',
          result: stringify(state.result ?? state.errorThrown ?? '(void)'),
        }
      } catch (e) {
        return {
          status: 'failed',
          message: safeStringify(e),
        }
      }
    },
  }
}

export function getTests(): TestRunner[] {
  return [
    createTest('passVariant(..)', () =>
      it('passVariant(..)', () => HybridTestObject.passVariant(5)).equals(5)
    ),
    createTest('createMap()', () =>
      it('createMap()', () => HybridTestObject.createMap()).didReturn('object')
    ),
    createTest('flip(..)', () =>
      it('flip(..)', () => HybridTestObject.flip([10, 5, 0])).equals([0, 5, 10])
    ),
    createTest('passTuple(..)', () =>
      it('passTuple(..)', () =>
        HybridTestObject.passTuple([53, 'helo', false])).equals([
        53,
        'helo',
        false,
      ])
    ),

    // Optional params test
    createTest('tryOptionalParams(..)', () =>
      it('tryOptionalParams(..)', () =>
        HybridTestObject.tryOptionalParams(55, true)).didNotThrow()
    ),
    createTest('tryOptionalParams(..)', () =>
      it('tryOptionalParams(..)', () =>
        HybridTestObject.tryOptionalParams(55, true, 'optional!')).didNotThrow()
    ),
    createTest('tryOptionalParams(..)', () =>
      it('tryOptionalParams(..)', () =>
        HybridTestObject.tryOptionalParams(
          55,
          true,
          'optional!',
          // @ts-expect-error
          false
        )).didThrow()
    ),
    createTest('tryOptionalParams(..)', () =>
      it('tryOptionalParams(..)', () =>
        // @ts-expect-error
        HybridTestObject.tryOptionalParams(55)).didThrow()
    ),

    // Throw tests
    createTest('funcThatThrows()', () =>
      it('funcThatThrows()', () => HybridTestObject.funcThatThrows()).didThrow()
    ),
    createTest('valueThatWillThrowOnAccess', () =>
      it('valueThatWillThrowOnAccess', () =>
        HybridTestObject.valueThatWillThrowOnAccess).didThrow()
    ),
    createTest('valueThatWillThrowOnAccess', () =>
      it('valueThatWillThrowOnAccess', () =>
        (HybridTestObject.valueThatWillThrowOnAccess = 55)).didThrow()
    ),
    // Callbacks
    createTest('getValueFromJsCallback(..)', () =>
      it('getValueFromJsCallback(..)', async () => {
        let result: string | undefined
        await HybridTestObject.getValueFromJsCallback(
          () => {
            // C++ calls this JS method to get that string
            return 'Hi from JS!'
          },
          (nativestring) => {
            // C++ calls this JS method, passing the string we got from JS before
            result = nativestring
          }
        )
        return result
      }).then((s) => s.equals('Hi from JS!'))
    ),
  ]
}
