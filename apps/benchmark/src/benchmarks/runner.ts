import {
  bootstrapMedianConfidenceInterval,
  median,
  medianAbsoluteDeviation,
  quantile,
  robustCoefficientOfVariationPercent,
} from './statistics'
import type {
  BenchmarkDefinition,
  BenchmarkMetric,
  BenchmarkRunnerOptions,
} from './types'

const MAX_CALIBRATION_STEPS = 24

function yieldToRuntime(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

async function executeBatch(
  definition: BenchmarkDefinition,
  iterations: number
): Promise<{ durationMs: number; checksum: number }> {
  const start = performance.now()
  const checksum =
    definition.kind === 'async'
      ? await definition.run(iterations)
      : definition.run(iterations)
  const durationMs = performance.now() - start

  if (!Number.isFinite(checksum) || durationMs < 0) {
    throw new Error(`Benchmark ${definition.id} produced an invalid sample.`)
  }
  const expectedChecksum = definition.expectedChecksum(iterations)
  if (checksum !== expectedChecksum) {
    throw new Error(
      `Benchmark ${definition.id} returned checksum ${checksum}, expected ${expectedChecksum}.`
    )
  }
  return { durationMs, checksum }
}

async function calibrateIterations(
  definition: BenchmarkDefinition,
  targetDurationMs: number
): Promise<number> {
  let iterations = definition.initialIterations ?? 1
  const maximum = definition.maxIterations ?? 100_000_000

  for (let step = 0; step < MAX_CALIBRATION_STEPS; step++) {
    const { durationMs } = await executeBatch(definition, iterations)
    await yieldToRuntime()
    if (durationMs >= targetDurationMs || iterations >= maximum) {
      return iterations
    }

    const scale = durationMs <= 0 ? 10 : targetDurationMs / durationMs
    const boundedScale = Math.max(2, Math.min(10, Math.ceil(scale)))
    iterations = Math.min(maximum, iterations * boundedScale)
  }

  return iterations
}

export async function runBenchmarkDefinitions(
  definitions: readonly BenchmarkDefinition[],
  options: BenchmarkRunnerOptions
): Promise<BenchmarkMetric[]> {
  const ordered = options.reverse
    ? [...definitions].reverse()
    : [...definitions]
  const metrics: BenchmarkMetric[] = []

  for (const definition of ordered) {
    const iterations = await calibrateIterations(
      definition,
      options.targetBatchDurationMs
    )

    let checksum = 0
    for (let index = 0; index < options.warmupCount; index++) {
      checksum += (await executeBatch(definition, iterations)).checksum
      await yieldToRuntime()
    }

    const samplesNsPerOp = new Array<number>(options.sampleCount)
    for (let index = 0; index < options.sampleCount; index++) {
      const sample = await executeBatch(definition, iterations)
      checksum += sample.checksum
      samplesNsPerOp[index] = (sample.durationMs * 1_000_000) / iterations
      await yieldToRuntime()
    }

    const metric: BenchmarkMetric = {
      id: definition.id,
      version: definition.version,
      family: definition.family,
      implementation: definition.implementation,
      advisory: definition.advisory ?? false,
      iterations,
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
      `[NitroBenchmark] ${metric.id}: ${metric.medianNsPerOp.toFixed(2)} ns/op`
    )
  }

  return metrics
}
