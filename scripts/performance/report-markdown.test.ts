import { describe, expect, test } from 'bun:test'
import type {
  MetricComparison,
  MetricVerdict,
  PlatformComparison,
} from './comparison'
import { renderPerformanceReportMarkdown } from './report-markdown'

const BASE_SHA = 'a'.repeat(40)
const HEAD_SHA = 'b'.repeat(40)

function metric(
  id: string,
  verdict: MetricVerdict,
  deltaPercent: number
): MetricComparison {
  return {
    id,
    advisory: verdict === 'advisory',
    baseMedianNsPerOp: 100,
    headMedianNsPerOp: 100 * (1 + deltaPercent / 100),
    deltaPercent,
    deltaConfidenceInterval95: [deltaPercent - 1, deltaPercent + 1],
    baseRobustCvPercent: 1,
    headRobustCvPercent: 1,
    budgetPercent: 5,
    verdict,
  }
}

function platform(
  platformName: 'android' | 'ios',
  comparisons: MetricComparison[],
  suiteComparable = true
): PlatformComparison {
  return {
    schemaVersion: 1,
    platform: platformName,
    baseSha: BASE_SHA,
    headSha: HEAD_SHA,
    baseSuiteHash: 'c'.repeat(64),
    headSuiteHash: suiteComparable ? 'c'.repeat(64) : 'd'.repeat(64),
    suiteComparable,
    advisoryMode: true,
    rerunRecommended: comparisons.some(
      (entry) => entry.verdict === 'inconclusive'
    ),
    hasRegression: comparisons.some((entry) => entry.verdict === 'regression'),
    comparisons,
  }
}

describe('performance report Markdown', () => {
  test('shows decisive changes and collapses all other results', () => {
    const comparisons = [
      metric('javascript/control/add-numbers', 'unchanged', 1),
      metric('turbo-module/control/add-numbers', 'inconclusive', 7),
      metric('nitro-cpp/primitive/simple-func', 'regression', 15),
      metric('nitro-cpp/primitive/add-numbers', 'improvement', -12),
      metric('nitro-cpp/variant/number-or-string', 'unchanged', 2),
      metric('nitro-cpp/promise/immediate', 'advisory', 20),
    ]
    const markdown = renderPerformanceReportMarkdown(
      [{ comparison: platform('android', comparisons) }],
      {
        advisory: true,
        repository: 'margelo/nitro',
        baseSha: BASE_SHA,
        headSha: HEAD_SHA,
        workflowRunUrl:
          'https://github.com/margelo/nitro/actions/runs/123456789',
      }
    )

    const decisive = markdown.split('<details>')[0]!
    const collapsed = markdown.split('<details>')[1]!
    expect(decisive).toContain('<strong>C++</strong> <code>simpleFunc()</code>')
    expect(decisive).toContain(
      '<td align="right"><strong>100.0 ns</strong></td>'
    )
    expect(decisive).toContain('<td>🔴 +15% slower</td>')
    expect(decisive).toContain('<strong>C++</strong> <code>addNumbers()</code>')
    expect(decisive).toContain(
      '<td align="right"><strong>88.0 ns</strong></td>'
    )
    expect(decisive).toContain('<td>🟢 -12% faster</td>')
    expect(decisive).not.toContain('<strong>JavaScript</strong>')
    expect(collapsed).toContain('<summary>All Benchmarks</summary>')
    expect(collapsed).toContain(
      '<strong>JavaScript</strong> <code>addNumbers()</code>'
    )
    expect(collapsed).toContain('<code>number | string variant</code>')
    expect(collapsed).toContain('⚪ ~1% unchanged')
    expect(collapsed).toContain('🟡 +7% slower (noisy)')
    expect(collapsed).toContain('ℹ️ +20% slower (advisory)')
    expect(collapsed).toContain('  <table>\n    <thead>\n      <tr>')
    expect(markdown).not.toContain('| Benchmark |')
    expect(markdown).toContain(
      `Benchmarking Code Diff [\`${BASE_SHA.slice(0, 8)}\`...\`${HEAD_SHA.slice(0, 8)}\`](https://github.com/margelo/nitro/compare/${BASE_SHA}..${HEAD_SHA}) ([view raw output](https://github.com/margelo/nitro/actions/runs/123456789))`
    )
  })

  test('prints iOS before Android regardless of input order', () => {
    const markdown = renderPerformanceReportMarkdown(
      [
        { comparison: platform('android', []) },
        { comparison: platform('ios', []) },
      ],
      {
        advisory: true,
        repository: 'margelo/nitro',
        baseSha: BASE_SHA,
        headSha: HEAD_SHA,
      }
    )
    expect(markdown.indexOf('### iOS')).toBeLessThan(
      markdown.indexOf('### Android')
    )
    expect(markdown.match(/Performance is unchanged! 😎/g)).toHaveLength(2)
  })

  test('makes incompatible benchmark definitions an explicit rebaseline', () => {
    const markdown = renderPerformanceReportMarkdown(
      [{ comparison: platform('ios', [], false) }],
      {
        advisory: true,
        repository: 'margelo/nitro',
        baseSha: BASE_SHA,
        headSha: HEAD_SHA,
      }
    )

    expect(markdown).toContain('Results require a new baseline')
    expect(markdown).not.toContain('<details>')
  })
})
