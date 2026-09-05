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
      metric('nitro-cpp/promise/immediate', 'advisory', 20),
    ]
    const markdown = renderPerformanceReportMarkdown(
      [{ comparison: platform('android', comparisons), pairedRunCount: 3 }],
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
    expect(decisive).toContain('**C++** · `simpleFunc()`')
    expect(decisive).toContain('| **100.0 ns** | 115.0 ns | 🔴 +15% slower |')
    expect(decisive).toContain('**C++** · `addNumbers()`')
    expect(decisive).toContain('| 100.0 ns | **88.0 ns** | 🟢 -12% faster |')
    expect(decisive).not.toContain('**JavaScript**')
    expect(collapsed).toContain('<summary>All Benchmarks</summary>')
    expect(collapsed).toContain('**JavaScript** · `addNumbers()`')
    expect(collapsed).toContain('⚪ ~1% unchanged')
    expect(collapsed).toContain('🟡 +7% slower (noisy)')
    expect(collapsed).toContain('ℹ️ +20% slower (advisory)')
    expect(markdown).toContain(
      '[📊 View the workflow run and raw benchmark artifacts]'
    )
    expect(markdown).toContain(
      '[🔍 View the code diff between Before and After](https://github.com/margelo/nitro/compare/'
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
      [{ comparison: platform('ios', [], false), pairedRunCount: 2 }],
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
