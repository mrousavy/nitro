import { describe, it } from 'react-native-harness'
import { NitroModules } from 'react-native-nitro-modules'
import type {
  TestObjectCpp,
  TestObjectSwiftKotlin,
} from 'react-native-nitro-test'
import { getTests, getIssue1439Tests } from '../src/getTests'
import { harnessBackend } from '../src/testing/backends/harness'

function createTestRunner(
  testObject: TestObjectCpp | TestObjectSwiftKotlin
): () => void {
  return () => {
    const tests = getTests(testObject, { backend: harnessBackend })
    for (const test of tests) {
      it(test.name, async () => {
        const result = await test.run()
        if (result.status === 'failed') {
          throw new Error(result.message)
        }
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
describe('Issue 1439', () => {
  const tests = getIssue1439Tests({ backend: harnessBackend })
  for (const test of tests) {
    it(test.name, async () => {
      const result = await test.run()
      if (result.status === 'failed') {
        throw new Error(result.message)
      }
    })
  }
})
