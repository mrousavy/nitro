import {
  bootstrapMedianConfidenceInterval,
  median,
  medianAbsoluteDeviation,
  quantile,
  robustCoefficientOfVariationPercent,
} from './statistics'
import { calibrateIterations, roundIterations } from './calibration'
import { benchmarkRuntime, executeBatch, type BenchmarkRuntime } from './batch'
import type {
  BenchmarkDefinition,
  BenchmarkMetric,
  BenchmarkRunnerOptions,
} from './types'

export async function runBenchmarkDefinitions(
  definitions: readonly BenchmarkDefinition[],
  options: BenchmarkRunnerOptions,
  runtime: BenchmarkRuntime = benchmarkRuntime
): Promise<BenchmarkMetric[]> {
  const ordered = options.reverse
    ? [...definitions].reverse()
    : [...definitions]
  const metrics: BenchmarkMetric[] = []

  for (const definition of ordered) {
    let iterations = definition.initialIterations ?? 1_000
    let checksum = 0
    for (let attempt = 0; attempt < 3; attempt++) {
      iterations = await calibrateIterations(
        async (count) =>
          (await executeBatch(definition, count, runtime)).durationMs,
        options.targetBatchDurationMs,
        iterations,
        definition.maxIterations
      )
      checksum = 0
      const warmupDurations: number[] = []
      for (let index = 0; index < options.warmupCount; index++) {
        const warmup = await executeBatch(definition, iterations, runtime)
        checksum += warmup.checksum
        warmupDurations.push(warmup.durationMs)
      }
      const warmupMedian = median(warmupDurations)
      if (
        warmupMedian >= options.targetBatchDurationMs * (2 / 3) &&
        warmupMedian <= options.targetBatchDurationMs * (4 / 3)
      )
        break
      if (attempt === 2) {
        throw new Error(
          `Benchmark ${definition.id} did not stabilize after warmup.`
        )
      }
      iterations = roundIterations(
        (iterations * options.targetBatchDurationMs) / warmupMedian,
        definition.maxIterations ?? 100_000_000
      )
    }

    // Freeze the count for all measured samples. Do not discard slow samples
    // or tune iterations from measured results: that would bias the comparison.
    const samplesNsPerOp = new Array<number>(options.sampleCount)
    for (let index = 0; index < options.sampleCount; index++) {
      const sample = await executeBatch(definition, iterations, runtime)
      checksum += sample.checksum
      samplesNsPerOp[index] = (sample.durationMs * 1_000_000) / iterations
    }

    const metric: BenchmarkMetric = {
      id: definition.id,
      version: definition.version,
      family: definition.family,
      implementation: definition.implementation,
      advisory: definition.advisory ?? false,
      iterations,
      chunkIterations: Math.min(
        iterations,
        definition.maxChunkIterations ?? iterations
      ),
      samplesNsPerOp,
      medianNsPerOp: median(samplesNsPerOp),
      p95NsPerOp: quantile(samplesNsPerOp, 0.95),
      medianAbsoluteDeviationNsPerOp: medianAbsoluteDeviation(samplesNsPerOp),
      robustCoefficientOfVariationPercent:
        robustCoefficientOfVariationPercent(samplesNsPerOp),
      medianConfidenceInterval95: bootstrapMedianConfidenceInterval(
        samplesNsPerOp,
        2_000,
        definition.id
      ),
      checksum,
    }
    metrics.push(metric)
    console.info(
      `[NitroBenchmark] ${metric.id}: ${metric.medianNsPerOp.toFixed(2)} ns/op; ${iterations} ops/sample, chunks of ${metric.chunkIterations}, median timed batch ${((metric.medianNsPerOp * iterations) / 1_000_000).toFixed(1)} ms`
    )
  }

  return metrics
}
