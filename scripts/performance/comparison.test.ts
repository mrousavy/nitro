import { describe, expect, test } from 'bun:test'
import type { BenchmarkRunResult } from '../../apps/benchmark/src/benchmarks/types'
import { compareRuns, toBencherMetricFormat } from './comparison'
import { validateBenchmarkRun } from './schema'

const BASE_SHA = 'a'.repeat(40)
const HEAD_SHA = 'b'.repeat(40)

function run(
  sha: string,
  samples: number[],
  suiteHash = 'c'.repeat(64)
): BenchmarkRunResult {
  return {
    schemaVersion: 1,
    suiteVersion: 1,
    configuration: {
      runId: `run-${sha[0]}`,
      reverse: false,
      commitSha: sha,
      suiteHash,
      platform: 'ios',
      device: 'iPhone',
      osVersion: '26.5',
      architecture: 'arm64',
      toolchain: 'Xcode 26.5',
    },
    environment: {
      reactNativeVersion: '0.85.3',
      hermes: true,
      dev: false,
      nitroBuildType: 'release',
    },
    runner: {
      targetBatchDurationMs: 150,
      warmupCount: 5,
      sampleCount: samples.length,
    },
    startedAt: '2026-09-03T00:00:00.000Z',
    durationMs: 1_000,
    metrics: [
      {
        id: 'nitro-cpp/primitive/add-numbers',
        version: 1,
        family: 'primitive',
        implementation: 'nitro-cpp',
        advisory: false,
        iterations: 10_000,
        samplesNsPerOp: samples,
        medianNsPerOp: samples[2]!,
        p95NsPerOp: Math.max(...samples),
        medianAbsoluteDeviationNsPerOp: 1,
        robustCoefficientOfVariationPercent: 1,
        medianConfidenceInterval95: [
          Math.min(...samples),
          Math.max(...samples),
        ],
        checksum: 42,
      },
    ],
  }
}

describe('performance comparison', () => {
  test('keeps an A/A run unchanged', () => {
    const samples = [99, 100, 100, 101, 100]
    const comparison = compareRuns(
      [run(BASE_SHA, samples)],
      [run(HEAD_SHA, samples)],
      true
    )
    expect(comparison.comparisons[0]?.verdict).toBe('unchanged')
    expect(comparison.hasRegression).toBe(false)
  })

  test('detects regressions and improvements', () => {
    const base = [run(BASE_SHA, [99, 100, 100, 101, 100])]
    const regression = compareRuns(
      base,
      [run(HEAD_SHA, [114, 115, 115, 116, 115])],
      true
    )
    expect(regression.comparisons[0]?.verdict).toBe('regression')

    const improvement = compareRuns(
      base,
      [run(HEAD_SHA, [84, 85, 85, 86, 85])],
      true
    )
    expect(improvement.comparisons[0]?.verdict).toBe('improvement')
  })

  test('does not mistake process-level A/A drift for independent evidence', () => {
    // Rounded run medians from the accelerated Android bootstrap A/A run.
    const samples = (value: number) =>
      Array.from({ length: 20 }, (_, index) => value + (index % 3) - 1)
    const comparison = compareRuns(
      [540, 527, 523].map((value) => run(BASE_SHA, samples(value))),
      [529, 579, 556].map((value) => run(HEAD_SHA, samples(value))),
      true
    )
    expect(comparison.hasRegression).toBe(false)
    expect(comparison.comparisons[0]?.verdict).toBe('inconclusive')
    expect(
      comparison.comparisons[0]?.deltaConfidenceInterval95[0]
    ).toBeLessThan(0)
    expect(comparison.rerunRecommended).toBe(true)
  })

  test('detects a consistent 15% change across independent process pairs', () => {
    for (const scale of [0.85, 1.15]) {
      const samples = [99, 100, 100, 101, 100]
      const comparison = compareRuns(
        [1, 2, 3].map(() => run(BASE_SHA, samples)),
        [1, 2, 3].map(() =>
          run(
            HEAD_SHA,
            samples.map((n) => n * scale)
          )
        ),
        true
      )
      expect(comparison.comparisons[0]?.verdict).toBe(
        scale > 1 ? 'regression' : 'improvement'
      )
    }
  })

  test('marks changed suites for rebaseline', () => {
    const comparison = compareRuns(
      [run(BASE_SHA, [99, 100, 100, 101, 100], 'c'.repeat(64))],
      [run(HEAD_SHA, [99, 100, 100, 101, 100], 'd'.repeat(64))],
      true
    )
    expect(comparison.suiteComparable).toBe(false)
    expect(comparison.comparisons).toEqual([])
  })

  test('validates release metadata and converts BMF', () => {
    const result = validateBenchmarkRun(run(HEAD_SHA, [99, 100, 100, 101, 100]))
    const bmf = toBencherMetricFormat([result])
    expect(bmf['nitro-cpp/primitive/add-numbers']?.latency.value).toBe(100)
  })

  test('includes between-run variation in Bencher confidence bounds', () => {
    const bmf = toBencherMetricFormat(
      [100, 200, 300].map((value) =>
        run(
          HEAD_SHA,
          Array.from({ length: 20 }, () => value)
        )
      )
    )
    const latency = bmf['nitro-cpp/primitive/add-numbers']!.latency
    expect(latency.value).toBe(200)
    expect(latency.lower_value).toBe(100)
    expect(latency.upper_value).toBe(300)
  })

  test('rejects a non-release result', () => {
    const invalid = run(HEAD_SHA, [99, 100, 100, 101, 100])
    invalid.environment.dev = true
    expect(() => validateBenchmarkRun(invalid)).toThrow('production Hermes')
  })
})
