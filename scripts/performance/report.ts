import { readFile } from 'node:fs/promises'
import { parseArguments, repeatedArgument, requiredArgument } from './args'
import type { PlatformComparison } from './comparison'

interface PerformanceReport {
  schemaVersion: 1
  eventName: 'pull_request' | 'push' | 'schedule' | 'workflow_dispatch'
  repository: string
  pullRequestNumber: number | null
  baseSha: string
  headSha: string
  generatedAt: string
  comparisons: PlatformComparison[]
}

function isComparison(value: unknown): value is PlatformComparison {
  if (value == null || typeof value !== 'object') return false
  const comparison = value as Partial<PlatformComparison>
  return (
    comparison.schemaVersion === 1 &&
    (comparison.platform === 'ios' || comparison.platform === 'android') &&
    typeof comparison.baseSha === 'string' &&
    typeof comparison.headSha === 'string' &&
    typeof comparison.suiteComparable === 'boolean' &&
    Array.isArray(comparison.comparisons)
  )
}

const argumentsMap = parseArguments(Bun.argv.slice(2))
const comparisonFiles = repeatedArgument(argumentsMap, 'comparison')
const markdownFiles = repeatedArgument(argumentsMap, 'markdown')
const output = requiredArgument(argumentsMap, 'output')
const markdownOutput = requiredArgument(argumentsMap, 'markdown-output')
const repository = requiredArgument(argumentsMap, 'repository')
const eventName = requiredArgument(argumentsMap, 'event-name')
if (
  eventName !== 'pull_request' &&
  eventName !== 'push' &&
  eventName !== 'schedule' &&
  eventName !== 'workflow_dispatch'
) {
  throw new Error(`Unsupported event: ${eventName}`)
}
const pullRequest = Number(argumentsMap.get('pull-request')?.[0] ?? '0') || null

const comparisons = await Promise.all(
  comparisonFiles.map(async (file) => {
    const value: unknown = JSON.parse(await readFile(file, 'utf8'))
    if (!isComparison(value))
      throw new Error(`Invalid comparison file: ${file}`)
    return value
  })
)
if (comparisons.length === 0) throw new Error('No comparisons supplied.')
const baseSha = comparisons[0]!.baseSha
const headSha = comparisons[0]!.headSha
if (
  comparisons.some(
    (comparison) =>
      comparison.baseSha !== baseSha || comparison.headSha !== headSha
  )
) {
  throw new Error('Platform comparisons refer to different commits.')
}

const report: PerformanceReport = {
  schemaVersion: 1,
  eventName,
  repository,
  pullRequestNumber: pullRequest,
  baseSha,
  headSha,
  generatedAt: new Date().toISOString(),
  comparisons,
}
const platformMarkdown = await Promise.all(
  markdownFiles.map((file) => readFile(file, 'utf8'))
)
const advisory = comparisons.every((comparison) => comparison.advisoryMode)
const summary = [
  '## Nitro performance',
  '',
  advisory
    ? '> Performance changes are advisory while the baseline is being calibrated.'
    : '> Stable metrics are enforced against their calibrated regression budgets.',
  '',
  ...platformMarkdown.map((markdown) => markdown.trim()),
  '',
  `<sub>Base \`${baseSha.slice(0, 8)}\` · Head \`${headSha.slice(0, 8)}\` · lower is better</sub>`,
  '',
].join('\n')

await Promise.all([
  Bun.write(output, `${JSON.stringify(report, null, 2)}\n`),
  Bun.write(markdownOutput, summary),
])
