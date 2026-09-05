import { mkdir, readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { parseArguments, requiredArgument } from './args'
import {
  compareRuns,
  type MetricComparison,
  type PlatformComparison,
  toBencherMetricFormat,
} from './comparison'
import { renderPerformanceReportMarkdown } from './report-markdown'
import { isSafeSha, validateBenchmarkRun } from './schema'
import type { BenchmarkRunResult } from '../../apps/benchmark/src/benchmarks/types'

const MAX_FILE_BYTES = 5 * 1024 * 1024
const METRIC_ID_PATTERN = /^[a-z0-9][a-z0-9/._-]{0,199}$/

interface TrustedWorkflowRunEvent {
  repository: { full_name: string }
  workflow_run: {
    id: number
    html_url: string
    event: 'pull_request' | 'push' | 'schedule' | 'workflow_dispatch'
    head_sha: string
    head_repository: { full_name: string }
  }
}

interface TrustedPullRequest {
  number: number
  base: { sha: string; repo: { full_name: string } }
  head: { sha: string; repo: { full_name: string } }
}

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

function object(value: unknown, name: string): Record<string, unknown> {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${name} must be an object.`)
  }
  return value as Record<string, unknown>
}

function boundedString(value: unknown, name: string): string {
  if (typeof value !== 'string' || value.length === 0 || value.length > 256) {
    throw new Error(`${name} must be a bounded string.`)
  }
  return value
}

function finiteNumber(value: unknown, name: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${name} must be finite.`)
  }
  return value
}

async function readBoundedJson(file: string): Promise<unknown> {
  const information = await stat(file)
  if (information.size <= 0 || information.size > MAX_FILE_BYTES) {
    throw new Error(`${file} has an invalid size.`)
  }
  return JSON.parse(await readFile(file, 'utf8'))
}

function validateTrustedWorkflowRunEvent(
  value: unknown
): TrustedWorkflowRunEvent {
  const event = object(value, 'workflow_run event')
  const repository = object(event.repository, 'event.repository')
  const workflowRun = object(event.workflow_run, 'event.workflow_run')
  const headRepository = object(
    workflowRun.head_repository,
    'event.workflow_run.head_repository'
  )
  const eventName = workflowRun.event
  const id = finiteNumber(workflowRun.id, 'event.workflow_run.id')
  if (
    eventName !== 'pull_request' &&
    eventName !== 'push' &&
    eventName !== 'schedule' &&
    eventName !== 'workflow_dispatch'
  ) {
    throw new Error('Trusted workflow run has an unsupported event.')
  }
  const headSha = boundedString(
    workflowRun.head_sha,
    'event.workflow_run.head_sha'
  )
  if (!Number.isSafeInteger(id) || id < 1 || !isSafeSha(headSha)) {
    throw new Error('Trusted workflow run identity is invalid.')
  }
  return {
    repository: {
      full_name: boundedString(repository.full_name, 'repository.full_name'),
    },
    workflow_run: {
      id,
      html_url: boundedString(
        workflowRun.html_url,
        'event.workflow_run.html_url'
      ),
      event: eventName,
      head_sha: headSha,
      head_repository: {
        full_name: boundedString(
          headRepository.full_name,
          'event.workflow_run.head_repository.full_name'
        ),
      },
    },
  }
}

function validateTrustedPullRequest(value: unknown): TrustedPullRequest {
  const pullRequest = object(value, 'trusted pull request')
  const base = object(pullRequest.base, 'pull_request.base')
  const head = object(pullRequest.head, 'pull_request.head')
  const baseRepository = object(base.repo, 'pull_request.base.repo')
  const headRepository = object(head.repo, 'pull_request.head.repo')
  const number = finiteNumber(pullRequest.number, 'pull_request.number')
  const baseSha = boundedString(base.sha, 'pull_request.base.sha')
  const headSha = boundedString(head.sha, 'pull_request.head.sha')
  if (
    !Number.isInteger(number) ||
    number < 1 ||
    !isSafeSha(baseSha) ||
    !isSafeSha(headSha)
  ) {
    throw new Error('Trusted pull request metadata is invalid.')
  }
  return {
    number,
    base: {
      sha: baseSha,
      repo: {
        full_name: boundedString(
          baseRepository.full_name,
          'pull_request.base.repo.full_name'
        ),
      },
    },
    head: {
      sha: headSha,
      repo: {
        full_name: boundedString(
          headRepository.full_name,
          'pull_request.head.repo.full_name'
        ),
      },
    },
  }
}

function validateMetricComparison(value: unknown): MetricComparison {
  const metric = object(value, 'metric comparison')
  const id = boundedString(metric.id, 'metric.id')
  if (!METRIC_ID_PATTERN.test(id)) throw new Error(`Unsafe metric ID: ${id}`)
  const interval = metric.deltaConfidenceInterval95
  if (!Array.isArray(interval) || interval.length !== 2) {
    throw new Error(`Invalid confidence interval for ${id}.`)
  }
  const verdict = metric.verdict
  if (
    verdict !== 'improvement' &&
    verdict !== 'regression' &&
    verdict !== 'unchanged' &&
    verdict !== 'inconclusive' &&
    verdict !== 'advisory'
  ) {
    throw new Error(`Invalid verdict for ${id}.`)
  }
  if (typeof metric.advisory !== 'boolean') {
    throw new Error(`Invalid advisory state for ${id}.`)
  }
  return {
    id,
    advisory: metric.advisory,
    baseMedianNsPerOp: finiteNumber(metric.baseMedianNsPerOp, `${id}.base`),
    headMedianNsPerOp: finiteNumber(metric.headMedianNsPerOp, `${id}.head`),
    deltaPercent: finiteNumber(metric.deltaPercent, `${id}.delta`),
    deltaConfidenceInterval95: [
      finiteNumber(interval[0], `${id}.interval[0]`),
      finiteNumber(interval[1], `${id}.interval[1]`),
    ],
    baseRobustCvPercent: finiteNumber(
      metric.baseRobustCvPercent,
      `${id}.baseCv`
    ),
    headRobustCvPercent: finiteNumber(
      metric.headRobustCvPercent,
      `${id}.headCv`
    ),
    budgetPercent: finiteNumber(metric.budgetPercent, `${id}.budget`),
    verdict,
  }
}

function validateComparison(value: unknown): PlatformComparison {
  const comparison = object(value, 'comparison')
  const platform = comparison.platform
  if (platform !== 'ios' && platform !== 'android') {
    throw new Error('Invalid comparison platform.')
  }
  const baseSha = boundedString(comparison.baseSha, 'comparison.baseSha')
  const headSha = boundedString(comparison.headSha, 'comparison.headSha')
  if (!isSafeSha(baseSha) || !isSafeSha(headSha)) {
    throw new Error('Comparison SHAs are invalid.')
  }
  if (
    typeof comparison.suiteComparable !== 'boolean' ||
    typeof comparison.advisoryMode !== 'boolean' ||
    typeof comparison.rerunRecommended !== 'boolean' ||
    typeof comparison.hasRegression !== 'boolean'
  ) {
    throw new Error('Comparison flags are invalid.')
  }
  if (
    !Array.isArray(comparison.comparisons) ||
    comparison.comparisons.length > 100
  ) {
    throw new Error('Comparison metrics are invalid.')
  }
  return {
    schemaVersion: 1,
    platform,
    baseSha,
    headSha,
    baseSuiteHash: boundedString(comparison.baseSuiteHash, 'baseSuiteHash'),
    headSuiteHash: boundedString(comparison.headSuiteHash, 'headSuiteHash'),
    suiteComparable: comparison.suiteComparable,
    advisoryMode: comparison.advisoryMode,
    rerunRecommended: comparison.rerunRecommended,
    hasRegression: comparison.hasRegression,
    comparisons: comparison.comparisons.map(validateMetricComparison),
  }
}

function validateReport(value: unknown): PerformanceReport {
  const report = object(value, 'report')
  if (
    report.schemaVersion !== 1 ||
    !Array.isArray(report.comparisons) ||
    report.comparisons.length !== 2
  ) {
    throw new Error('Invalid performance report.')
  }
  const pullRequestNumber =
    report.pullRequestNumber === null
      ? null
      : finiteNumber(report.pullRequestNumber, 'report.pullRequestNumber')
  if (
    pullRequestNumber !== null &&
    (!Number.isInteger(pullRequestNumber) || pullRequestNumber < 1)
  ) {
    throw new Error('Invalid report pull request number.')
  }
  const eventName = report.eventName
  if (
    eventName !== 'pull_request' &&
    eventName !== 'push' &&
    eventName !== 'schedule' &&
    eventName !== 'workflow_dispatch'
  ) {
    throw new Error('Invalid report event name.')
  }
  const baseSha = boundedString(report.baseSha, 'report.baseSha')
  const headSha = boundedString(report.headSha, 'report.headSha')
  if (!isSafeSha(baseSha) || !isSafeSha(headSha)) {
    throw new Error('Report SHAs are invalid.')
  }
  const comparisons = report.comparisons.map(validateComparison)
  if (
    !comparisons.some((comparison) => comparison.platform === 'android') ||
    !comparisons.some((comparison) => comparison.platform === 'ios')
  ) {
    throw new Error('Report must contain Android and iOS exactly once.')
  }
  const generatedAt = boundedString(report.generatedAt, 'report.generatedAt')
  if (Number.isNaN(Date.parse(generatedAt))) {
    throw new Error('Report timestamp is invalid.')
  }
  return {
    schemaVersion: 1,
    eventName,
    repository: boundedString(report.repository, 'report.repository'),
    pullRequestNumber,
    baseSha,
    headSha,
    generatedAt,
    comparisons,
  }
}

const argumentsMap = parseArguments(Bun.argv.slice(2))
const artifactDirectory = requiredArgument(argumentsMap, 'artifact-directory')
const outputDirectory = requiredArgument(argumentsMap, 'output-directory')
const expectedRepository = requiredArgument(argumentsMap, 'expected-repository')
const trustedWorkflowEventPath = requiredArgument(
  argumentsMap,
  'trusted-workflow-event'
)

const trustedWorkflowEvent = validateTrustedWorkflowRunEvent(
  await readBoundedJson(trustedWorkflowEventPath)
)
const report = validateReport(
  await readBoundedJson(path.join(artifactDirectory, 'performance-report.json'))
)
if (
  trustedWorkflowEvent.repository.full_name !== expectedRepository ||
  trustedWorkflowEvent.workflow_run.event !== report.eventName ||
  report.repository !== expectedRepository ||
  report.headSha !== trustedWorkflowEvent.workflow_run.head_sha
) {
  throw new Error(
    'Artifact event metadata does not match the triggering workflow.'
  )
}
const workflowRunUrl = `https://github.com/${expectedRepository}/actions/runs/${trustedWorkflowEvent.workflow_run.id}`
if (trustedWorkflowEvent.workflow_run.html_url !== workflowRunUrl) {
  throw new Error('Trusted workflow run URL is invalid.')
}

if (report.eventName === 'pull_request') {
  const trustedPullRequestPath = requiredArgument(
    argumentsMap,
    'trusted-pull-request'
  )
  const pullRequest = validateTrustedPullRequest(
    await readBoundedJson(trustedPullRequestPath)
  )
  if (
    pullRequest.base.repo.full_name !== expectedRepository ||
    pullRequest.head.repo.full_name !==
      trustedWorkflowEvent.workflow_run.head_repository.full_name ||
    report.pullRequestNumber !== pullRequest.number ||
    report.baseSha !== pullRequest.base.sha ||
    report.headSha !== pullRequest.head.sha
  ) {
    throw new Error(
      'Artifact metadata does not match the trusted pull request.'
    )
  }
} else {
  if (report.pullRequestNumber !== null) {
    throw new Error(
      'Artifact metadata does not match the trusted workflow run.'
    )
  }
}
if (
  report.comparisons.some(
    (comparison) =>
      comparison.baseSha !== report.baseSha ||
      comparison.headSha !== report.headSha
  )
) {
  throw new Error('Platform comparison metadata does not match the report.')
}

async function loadRawRuns(
  platform: 'android' | 'ios',
  revision: 'base' | 'head',
  expectedSha: string
): Promise<BenchmarkRunResult[]> {
  const directory = path.join(artifactDirectory, 'raw', platform)
  const filePattern = new RegExp(`^${revision}-[1-3]\\.json$`)
  const files = (await readdir(directory))
    .filter((file) => filePattern.test(file))
    .sort()
  if (files.length < 2 || files.length > 3) {
    throw new Error(`Expected two or three ${platform} ${revision} runs.`)
  }
  return Promise.all(
    files.map(async (file) => {
      const run = validateBenchmarkRun(
        await readBoundedJson(path.join(directory, file))
      )
      if (
        run.configuration.platform !== platform ||
        run.configuration.commitSha !== expectedSha ||
        run.runner.targetBatchDurationMs !== 150 ||
        run.runner.warmupCount !== 5 ||
        run.runner.sampleCount !== 20 ||
        run.metrics.some(
          (metric) =>
            metric.samplesNsPerOp.length !== 20 ||
            !METRIC_ID_PATTERN.test(metric.id)
        )
      ) {
        throw new Error(`${platform} ${revision} run metadata is invalid.`)
      }
      return run
    })
  )
}

const rebuiltComparisons = await Promise.all(
  report.comparisons.map(async (uploadedComparison) => {
    if (!uploadedComparison.advisoryMode) {
      throw new Error('Performance enforcement cannot be enabled by PR code.')
    }
    const [baseRuns, headRuns] = await Promise.all([
      loadRawRuns(uploadedComparison.platform, 'base', report.baseSha),
      loadRawRuns(uploadedComparison.platform, 'head', report.headSha),
    ])
    if (baseRuns.length !== headRuns.length) {
      throw new Error('Base and head run counts must match.')
    }
    const comparison = compareRuns(baseRuns, headRuns, true)
    return { comparison, baseRuns, headRuns }
  })
)

await mkdir(outputDirectory, { recursive: true })
const markdown = renderPerformanceReportMarkdown(
  rebuiltComparisons.map(({ comparison }) => ({
    comparison,
  })),
  {
    advisory: true,
    repository: expectedRepository,
    baseSha: report.baseSha,
    headSha: report.headSha,
    workflowRunUrl,
  }
)
await Bun.write(path.join(outputDirectory, 'performance-summary.md'), markdown)
await Bun.write(
  path.join(outputDirectory, 'metadata.json'),
  `${JSON.stringify(
    {
      repository: report.repository,
      eventName: report.eventName,
      pullRequestNumber: report.pullRequestNumber,
      baseSha: report.baseSha,
      headSha: report.headSha,
      workflowRunUrl,
      platforms: rebuiltComparisons.map(
        ({ comparison }) => comparison.platform
      ),
    },
    null,
    2
  )}\n`
)

for (const { comparison, baseRuns, headRuns } of rebuiltComparisons) {
  for (const [suffix, runs] of [
    [`base-${comparison.platform}`, baseRuns],
    [comparison.platform, headRuns],
  ] as const) {
    await Bun.write(
      path.join(outputDirectory, `bencher-${suffix}.json`),
      `${JSON.stringify(toBencherMetricFormat(runs), null, 2)}\n`
    )
  }
}
