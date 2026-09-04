import {
  median,
  robustCoefficientOfVariationPercent,
} from '../../example/src/benchmarks/statistics'
import type {
  BenchmarkMetric,
  BenchmarkRunResult,
} from '../../example/src/benchmarks/types'
import {
  bootstrapPairedRunChange,
  bootstrapRunMedian,
} from './paired-bootstrap'

export type MetricVerdict =
  | 'improvement'
  | 'regression'
  | 'unchanged'
  | 'inconclusive'
  | 'advisory'

export interface MetricComparison {
  id: string
  advisory: boolean
  baseMedianNsPerOp: number
  headMedianNsPerOp: number
  deltaPercent: number
  deltaConfidenceInterval95: [number, number]
  baseRobustCvPercent: number
  headRobustCvPercent: number
  budgetPercent: number
  verdict: MetricVerdict
}

export interface PlatformComparison {
  schemaVersion: 1
  platform: 'android' | 'ios'
  baseSha: string
  headSha: string
  baseSuiteHash: string
  headSuiteHash: string
  suiteComparable: boolean
  advisoryMode: boolean
  rerunRecommended: boolean
  hasRegression: boolean
  comparisons: MetricComparison[]
}

export type BencherMetricFormat = Record<
  string,
  {
    latency: {
      value: number
      lower_value: number
      upper_value: number
    }
  }
>

function indexMetrics(
  runs: readonly BenchmarkRunResult[]
): Map<string, BenchmarkMetric[]> {
  const index = new Map<string, BenchmarkMetric[]>()
  for (const run of runs) {
    for (const metric of run.metrics) {
      index.set(metric.id, [...(index.get(metric.id) ?? []), metric])
    }
  }
  return index
}

function samples(metrics: readonly BenchmarkMetric[]): number[] {
  return metrics.flatMap((metric) => metric.samplesNsPerOp)
}

function verdictFor(
  advisory: boolean,
  deltaPercent: number,
  confidenceInterval: readonly [number, number],
  baseCv: number,
  headCv: number,
  budgetPercent: number
): MetricVerdict {
  if (advisory) return 'advisory'
  if (baseCv > 5 || headCv > 5) return 'inconclusive'
  if (deltaPercent >= budgetPercent && confidenceInterval[0] > 0) {
    return 'regression'
  }
  if (deltaPercent <= -budgetPercent && confidenceInterval[1] < 0) {
    return 'improvement'
  }
  if (Math.abs(deltaPercent) >= budgetPercent) return 'inconclusive'
  return 'unchanged'
}

export function compareRuns(
  baseRuns: readonly BenchmarkRunResult[],
  headRuns: readonly BenchmarkRunResult[],
  advisoryMode: boolean,
  budgetPercent = 5
): PlatformComparison {
  if (baseRuns.length === 0 || headRuns.length === 0) {
    throw new Error('At least one base and one head run are required.')
  }
  if (baseRuns.length !== headRuns.length) {
    throw new Error('A matching base run is required for every head run.')
  }
  const platform = baseRuns[0]!.configuration.platform
  const baseSha = baseRuns[0]!.configuration.commitSha
  const headSha = headRuns[0]!.configuration.commitSha
  for (const run of [...baseRuns, ...headRuns]) {
    if (run.configuration.platform !== platform) {
      throw new Error('Cannot compare results from different platforms.')
    }
  }
  for (const run of baseRuns) {
    if (run.configuration.commitSha !== baseSha) {
      throw new Error('Base runs have different commit SHAs.')
    }
  }
  for (const run of headRuns) {
    if (run.configuration.commitSha !== headSha) {
      throw new Error('Head runs have different commit SHAs.')
    }
  }

  const baseSuiteHash = baseRuns[0]!.configuration.suiteHash
  const headSuiteHash = headRuns[0]!.configuration.suiteHash
  const suiteComparable =
    baseRuns.every((run) => run.configuration.suiteHash === baseSuiteHash) &&
    headRuns.every((run) => run.configuration.suiteHash === headSuiteHash) &&
    baseSuiteHash === headSuiteHash

  const comparisons: MetricComparison[] = []
  if (suiteComparable) {
    const baseMetrics = indexMetrics(baseRuns)
    const headMetrics = indexMetrics(headRuns)
    if (
      baseMetrics.size !== headMetrics.size ||
      [...baseMetrics.keys()].some((id) => !headMetrics.has(id))
    ) {
      throw new Error('Base and head expose different benchmark IDs.')
    }

    for (const id of [...baseMetrics.keys()].sort()) {
      const base = baseMetrics.get(id)!
      const head = headMetrics.get(id)!
      const version = base[0]!.version
      if (base.length !== baseRuns.length || head.length !== headRuns.length) {
        throw new Error(`Benchmark ${id} is missing from a process run.`)
      }
      if (
        base.some((metric) => metric.version !== version) ||
        head.some((metric) => metric.version !== version)
      ) {
        throw new Error(`Benchmark version mismatch for ${id}.`)
      }
      const baseSamples = samples(base)
      const headSamples = samples(head)
      const baseMedian = median(baseSamples)
      const headMedian = median(headSamples)
      const deltaPercent = (headMedian / baseMedian - 1) * 100
      const interval = bootstrapPairedRunChange(
        base.map((metric) => metric.samplesNsPerOp),
        head.map((metric) => metric.samplesNsPerOp),
        10_000,
        `${platform}:${id}:${baseSha}:${headSha}`
      )
      const baseCv = Math.max(
        robustCoefficientOfVariationPercent(baseSamples),
        robustCoefficientOfVariationPercent(
          base.map((metric) => median(metric.samplesNsPerOp))
        )
      )
      const headCv = Math.max(
        robustCoefficientOfVariationPercent(headSamples),
        robustCoefficientOfVariationPercent(
          head.map((metric) => median(metric.samplesNsPerOp))
        )
      )
      const advisory = base[0]!.advisory || head[0]!.advisory
      comparisons.push({
        id,
        advisory,
        baseMedianNsPerOp: baseMedian,
        headMedianNsPerOp: headMedian,
        deltaPercent,
        deltaConfidenceInterval95: interval,
        baseRobustCvPercent: baseCv,
        headRobustCvPercent: headCv,
        budgetPercent,
        verdict: verdictFor(
          advisory,
          deltaPercent,
          interval,
          baseCv,
          headCv,
          budgetPercent
        ),
      })
    }
  }

  const hasRegression = comparisons.some(
    (comparison) => comparison.verdict === 'regression'
  )
  return {
    schemaVersion: 1,
    platform,
    baseSha,
    headSha,
    baseSuiteHash,
    headSuiteHash,
    suiteComparable,
    advisoryMode,
    rerunRecommended: comparisons.some(
      (comparison) => comparison.verdict === 'inconclusive'
    ),
    hasRegression,
    comparisons,
  }
}

export function toBencherMetricFormat(
  headRuns: readonly BenchmarkRunResult[]
): BencherMetricFormat {
  const metrics = indexMetrics(headRuns)
  return Object.fromEntries(
    [...metrics.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([id, entries]) => {
        const values = samples(entries)
        const interval = bootstrapRunMedian(
          entries.map((metric) => metric.samplesNsPerOp),
          10_000,
          `bencher:${id}`
        )
        return [
          id,
          {
            latency: {
              value: median(values),
              lower_value: interval[0],
              upper_value: interval[1],
            },
          },
        ]
      })
  )
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)} ms`
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)} µs`
  return `${value.toFixed(1)} ns`
}

function icon(verdict: MetricVerdict): string {
  switch (verdict) {
    case 'improvement':
      return '🟢 improvement'
    case 'regression':
      return '🔴 regression'
    case 'inconclusive':
      return '🟡 noisy'
    case 'advisory':
      return 'ℹ️ advisory'
    default:
      return '⚪ unchanged'
  }
}

export function renderPlatformMarkdown(comparison: PlatformComparison): string {
  const lines = [`### ${comparison.platform === 'ios' ? 'iOS' : 'Android'}`]
  if (!comparison.suiteComparable) {
    lines.push(
      '',
      '> Benchmark definitions changed in this PR. Results require a new baseline and are not compared.'
    )
    return lines.join('\n')
  }
  lines.push(
    '',
    '| Benchmark | Base | Head | Δ | 95% CI | Status |',
    '| --- | ---: | ---: | ---: | ---: | --- |'
  )
  for (const metric of comparison.comparisons) {
    lines.push(
      `| \`${metric.id}\` | ${formatNumber(metric.baseMedianNsPerOp)} | ${formatNumber(metric.headMedianNsPerOp)} | ${metric.deltaPercent.toFixed(2)}% | ${metric.deltaConfidenceInterval95[0].toFixed(2)}%…${metric.deltaConfidenceInterval95[1].toFixed(2)}% | ${icon(metric.verdict)} |`
    )
  }
  return lines.join('\n')
}
