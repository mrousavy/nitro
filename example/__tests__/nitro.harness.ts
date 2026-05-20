import { describe, it } from 'react-native-harness'
import { NitroModules } from 'react-native-nitro-modules'
import type {
  TestObjectCpp,
  TestObjectSwiftKotlin,
} from 'react-native-nitro-test'
import { getTests } from '../src/getTests'
import { harnessBackend } from '../src/testing/backends/harness'

function createTestRunner(
  testObject: TestObjectCpp | TestObjectSwiftKotlin
): () => void {
  return () => {
    const tests = getTests(testObject, {
      backend: harnessBackend,
      propagateFailures: true,
      asyncTimeoutMs: false,
    })
    for (const test of tests) {
      it(test.name, async () => {
        await test.run()
      })
    }
  }
}

const testObjectCpp =
  NitroModules.createHybridObject<TestObjectCpp>('TestObjectCpp')
const testObjectSwiftKotlin =
  NitroModules.createHybridObject<TestObjectSwiftKotlin>(
    'TestObjectSwiftKotlin'
  )

describe('TestObject (C++)', createTestRunner(testObjectCpp))
describe('TestObject (Swift/Kotlin)', createTestRunner(testObjectSwiftKotlin))
