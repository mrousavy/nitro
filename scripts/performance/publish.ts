import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { parseArguments, requiredArgument } from './args'
import { isSafeSha } from './schema'

interface Metadata {
  repository: string
  eventName: 'pull_request' | 'push' | 'schedule' | 'workflow_dispatch'
  pullRequestNumber: number | null
  baseSha: string
  headSha: string
  platforms: ('android' | 'ios')[]
}

function validateMetadata(value: unknown): Metadata {
  if (value == null || typeof value !== 'object') {
    throw new Error('Invalid metadata.')
  }
  const metadata = value as Partial<Metadata>
  if (
    typeof metadata.repository !== 'string' ||
    (metadata.eventName !== 'pull_request' &&
      metadata.eventName !== 'push' &&
      metadata.eventName !== 'schedule' &&
      metadata.eventName !== 'workflow_dispatch') ||
    (metadata.pullRequestNumber !== null &&
      (!Number.isInteger(metadata.pullRequestNumber) ||
        (metadata.pullRequestNumber ?? 0) < 1)) ||
    typeof metadata.baseSha !== 'string' ||
    typeof metadata.headSha !== 'string' ||
    !isSafeSha(metadata.baseSha) ||
    !isSafeSha(metadata.headSha) ||
    !Array.isArray(metadata.platforms) ||
    metadata.platforms.some(
      (platform) => platform !== 'android' && platform !== 'ios'
    )
  ) {
    throw new Error('Invalid metadata.')
  }
  return metadata as Metadata
}

const argumentsMap = parseArguments(Bun.argv.slice(2))
const directory = requiredArgument(argumentsMap, 'directory')
const project = process.env.BENCHER_PROJECT
const apiKey = process.env.BENCHER_API_KEY
const githubToken = process.env.GITHUB_TOKEN
if (project == null || apiKey == null || githubToken == null) {
  throw new Error(
    'BENCHER_PROJECT, BENCHER_API_KEY, and GITHUB_TOKEN are required.'
  )
}

const metadata = validateMetadata(
  JSON.parse(await readFile(path.join(directory, 'metadata.json'), 'utf8'))
)
const testbeds = {
  android: 'android-emulator-release-x86-64-api-36-ubuntu-24-04-kvm',
  ios: 'ios-simulator-release-arm64-xcode-26-5-ios-26-5',
} as const

for (const platform of metadata.platforms) {
  const command = [
    'bencher',
    'run',
    '--project',
    project,
    '--branch',
    metadata.pullRequestNumber == null
      ? 'main'
      : `pr-${metadata.pullRequestNumber}`,
    '--hash',
    metadata.headSha,
    '--testbed',
    testbeds[platform],
    '--adapter',
    'json',
    '--file',
    path.join(directory, `bencher-${platform}.json`),
    '--github-actions',
    githubToken,
    '--ci-id',
    `nitro-${platform}-release`,
    '--ci-public-links',
  ]
  if (metadata.pullRequestNumber != null) {
    command.push(
      '--start-point',
      'main',
      '--start-point-hash',
      metadata.baseSha,
      '--ci-number',
      String(metadata.pullRequestNumber)
    )
  }
  const process = Bun.spawn(command, {
    env: { ...Bun.env, BENCHER_API_KEY: apiKey },
    stdout: 'inherit',
    stderr: 'inherit',
  })
  const exitCode = await process.exited
  if (exitCode !== 0) {
    throw new Error(
      `Bencher failed for ${platform} with exit code ${exitCode}.`
    )
  }
}
