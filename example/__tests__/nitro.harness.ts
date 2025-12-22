import { describe, it } from 'react-native-harness'
import { NitroModules } from 'react-native-nitro-modules'
import type { TestObjectCpp } from 'react-native-nitro-test'
import { getTests } from '../src/getTests'
import { harnessBackend } from '../src/testing/backends/harness'

const testObject =
  NitroModules.createHybridObject<TestObjectCpp>('TestObjectCpp')
const tests = getTests(testObject, { backend: harnessBackend })

describe('Harness tests for Nitro', () => {
  for (const test of tests) {
    it(test.name, async () => {
      const result = await test.run()
      if (result.status === 'failed') {
        throw new Error(result.message)
      }
    })
  }
})
