import type { MetricComparison, PlatformComparison } from './comparison'

export interface PlatformReportMarkdownInput {
  comparison: PlatformComparison
  pairedRunCount?: number
}

export interface PerformanceReportMarkdownOptions {
  advisory: boolean
  repository: string
  baseSha: string
  headSha: string
  workflowRunUrl?: string
}

const OPERATION_NAMES: Readonly<Record<string, string>> = {
  'add-numbers': 'addNumbers()',
  'ascii-short': 'short ASCII string',
  'bounce-1-mib': 'bounce(1 MiB)',
  'bounce-4-kib': 'bounce(4 KiB)',
  'copy-1-mib': 'copy(1 MiB)',
  'copy-4-kib': 'copy(4 KiB)',
  'create': 'create()',
  'immediate': 'immediatePromise()',
  'large-1024': 'large array (1,024)',
  'nested-car': 'nested Car struct',
  'number-get-set': 'number property get/set',
  'number-or-string': 'number | string variant',
  'return-existing': 'returnExisting()',
  'simple-func': 'simpleFunc()',
  'small-16': 'small array (16)',
  'synchronous': 'synchronousCallback()',
  'trailing-string': 'optional trailing string',
  'typed-eight-entries': 'typed map (8 entries)',
  'unicode': 'Unicode string',
}

function platformName(platform: PlatformComparison['platform']): string {
  return platform === 'ios' ? 'iOS' : 'Android'
}

function implementationName(
  metricId: string,
  platform: PlatformComparison['platform']
): string {
  if (metricId.startsWith('javascript/')) return 'JavaScript'
  if (metricId.startsWith('turbo-module/')) return 'TurboModule'
  if (metricId.startsWith('nitro-cpp/')) return 'C++'
  if (metricId.startsWith('nitro-platform/')) {
    return platform === 'ios' ? 'Swift' : 'Kotlin'
  }
  return 'Benchmark'
}

function fallbackOperationName(operation: string): string {
  return `${operation.replace(/-([a-z0-9])/g, (_, letter: string) => letter.toUpperCase())}()`
}

function benchmarkName(
  metricId: string,
  platform: PlatformComparison['platform']
): string {
  const operation = metricId.split('/').at(-1)!
  const name = OPERATION_NAMES[operation] ?? fallbackOperationName(operation)
  return `**${implementationName(metricId, platform)}** · \`${name}\``
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)} ms`
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)} µs`
  return `${value.toFixed(1)} ns`
}

function formatPercent(value: number): string {
  return Math.abs(value)
    .toFixed(2)
    .replace(/\.0+$/, '')
    .replace(/(\.\d*[1-9])0+$/, '$1')
}

function directionalChange(deltaPercent: number): string {
  if (deltaPercent > 0) return `+${formatPercent(deltaPercent)}% slower`
  if (deltaPercent < 0) return `-${formatPercent(deltaPercent)}% faster`
  return '~0% unchanged'
}

function difference(metric: MetricComparison): string {
  switch (metric.verdict) {
    case 'regression':
      return `🔴 ${directionalChange(metric.deltaPercent)}`
    case 'improvement':
      return `🟢 ${directionalChange(metric.deltaPercent)}`
    case 'inconclusive':
      return `🟡 ${directionalChange(metric.deltaPercent)} (noisy)`
    case 'advisory':
      return `ℹ️ ${directionalChange(metric.deltaPercent)} (advisory)`
    case 'unchanged':
      return `⚪ ~${formatPercent(metric.deltaPercent)}% unchanged`
  }
}

function measurement(
  metric: MetricComparison,
  revision: 'base' | 'head'
): string {
  const before = metric.baseMedianNsPerOp
  const after = metric.headMedianNsPerOp
  const value = revision === 'base' ? before : after
  const isFaster = revision === 'base' ? before < after : after < before
  const formatted = formatNumber(value)
  return isFaster ? `**${formatted}**` : formatted
}

function renderMetricTable(
  metrics: readonly MetricComparison[],
  platform: PlatformComparison['platform']
): string {
  const lines = [
    '| Benchmark | Before | After | Difference |',
    '| --- | ---: | ---: | --- |',
  ]
  for (const metric of metrics) {
    lines.push(
      `| ${benchmarkName(metric.id, platform)} | ${measurement(metric, 'base')} | ${measurement(metric, 'head')} | ${difference(metric)} |`
    )
  }
  return lines.join('\n')
}

function renderPlatform(input: PlatformReportMarkdownInput): string[] {
  const { comparison, pairedRunCount } = input
  const name = platformName(comparison.platform)
  const lines = [`### ${name}`]
  if (!comparison.suiteComparable) {
    lines.push(
      '',
      '> Benchmark definitions changed in this PR. Results require a new baseline and are not compared.'
    )
    return lines
  }

  const changed = comparison.comparisons.filter(
    (metric) =>
      metric.verdict === 'regression' || metric.verdict === 'improvement'
  )
  const other = comparison.comparisons.filter(
    (metric) =>
      metric.verdict !== 'regression' && metric.verdict !== 'improvement'
  )
  lines.push(
    '',
    changed.length === 0
      ? 'Performance is unchanged! 😎'
      : renderMetricTable(changed, comparison.platform),
    '',
    '<details>',
    '<summary>All Benchmarks</summary>',
    '',
    other.length === 0
      ? 'Every benchmark had a decisive change.'
      : renderMetricTable(other, comparison.platform),
    '',
    '</details>'
  )
  if (pairedRunCount != null) {
    lines.push('', `<sub>${pairedRunCount} paired app-process runs</sub>`)
  }
  return lines
}

export function renderPerformanceReportMarkdown(
  platforms: readonly PlatformReportMarkdownInput[],
  options: PerformanceReportMarkdownOptions
): string {
  const orderedPlatforms = [...platforms].sort(
    ({ comparison: left }, { comparison: right }) =>
      left.platform === right.platform ? 0 : left.platform === 'ios' ? -1 : 1
  )
  const lines = [
    '## Performance Report',
    '',
    options.advisory
      ? '> ⚠️ **Advisory:** Results do not fail this PR while the baseline is being calibrated.'
      : '> Stable metrics are enforced against their calibrated regression budgets.',
  ]
  for (const platform of orderedPlatforms) {
    lines.push('', ...renderPlatform(platform))
  }

  const compareUrl = `https://github.com/${options.repository}/compare/${options.baseSha}..${options.headSha}`
  lines.push(
    '',
    `[🔍 View the code diff between Before and After](${compareUrl})`
  )
  if (options.workflowRunUrl != null) {
    lines.push(
      '',
      `[📊 View the workflow run and raw benchmark artifacts](${options.workflowRunUrl})`
    )
  }
  lines.push(
    '',
    `<sub>Before \`${options.baseSha.slice(0, 8)}\` · After \`${options.headSha.slice(0, 8)}\` · lower is better</sub>`,
    ''
  )
  return lines.join('\n')
}
