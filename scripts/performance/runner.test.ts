import { afterEach, describe, expect, spyOn, test } from 'bun:test'
import { runBenchmarkDefinitions } from '../../example/src/benchmarks/runner'
import type { BenchmarkDefinition } from '../../example/src/benchmarks/types'

afterEach(() => {
  spyOn(performance, 'now').mockRestore()
})

function definition(expectedChecksum: (iterations: number) => number) {
  return {
    id: 'javascript/control/fake-clock',
    version: 1,
    family: 'control',
    implementation: 'javascript',
    kind: 'sync',
    initialIterations: 1,
    maxIterations: 1,
    expectedChecksum,
    run: (iterations) => iterations * 2,
  } satisfies BenchmarkDefinition
}

describe('benchmark runner', () => {
  test('samples batches with a fake clock', async () => {
    let now = 0
    spyOn(performance, 'now').mockImplementation(() => now++)

    const [metric] = await runBenchmarkDefinitions(
      [definition((iterations) => iterations * 2)],
      {
        targetBatchDurationMs: 1,
        warmupCount: 1,
        sampleCount: 2,
        reverse: false,
      }
    )

    expect(metric?.iterations).toBe(1)
    expect(metric?.samplesNsPerOp).toEqual([1_000_000, 1_000_000])
    expect(metric?.checksum).toBe(6)
  })

  test('rejects an invalid checksum outside the timed region', async () => {
    let now = 0
    spyOn(performance, 'now').mockImplementation(() => now++)

    await expect(
      runBenchmarkDefinitions([definition(() => 99)], {
        targetBatchDurationMs: 1,
        warmupCount: 1,
        sampleCount: 1,
        reverse: false,
      })
    ).rejects.toThrow('returned checksum 2, expected 99')
  })
})
