import { describe, expect, it } from 'react-native-harness'
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

describe('ArrayBuffer external memory', () => {
  it('reports native buffer memory pressure to Hermes', () => {
    type HermesInternal = {
      getInstrumentedStats(): { js_externalBytes: number }
    }
    const hermesInternal = (
      globalThis as typeof globalThis & { HermesInternal?: HermesInternal }
    ).HermesInternal

    if (hermesInternal == null) {
      return
    }

    const size = 1024 * 1024
    const externalBytesBefore =
      hermesInternal.getInstrumentedStats().js_externalBytes
    const buffer = NitroModules.createNativeArrayBuffer(size)
    const externalBytesAfter =
      hermesInternal.getInstrumentedStats().js_externalBytes

    expect(buffer.byteLength).toBe(size)
    expect(externalBytesAfter - externalBytesBefore).toBe(size)
  })
})
