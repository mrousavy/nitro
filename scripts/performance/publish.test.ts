import { describe, expect, test } from 'bun:test'
import { bencherArguments, validateMetadata, type Metadata } from './publish'

const metadata: Metadata = {
  repository: 'margelo/nitro',
  eventName: 'pull_request',
  pullRequestNumber: 123,
  baseSha: 'a'.repeat(40),
  headSha: 'b'.repeat(40),
  platforms: ['android', 'ios'],
}

function option(args: string[], name: string) {
  return args[args.indexOf(name) + 1]
}

describe('Bencher publications', () => {
  test('seeds an exact paired baseline without labelling a stacked base as main', () => {
    const args = bencherArguments(
      metadata,
      'ios',
      'base',
      '/validated',
      'nitro'
    )
    expect(option(args, '--branch')).toBe(`baseline-${metadata.baseSha}`)
    expect(option(args, '--hash')).toBe(metadata.baseSha)
    expect(option(args, '--file')).toBe('/validated/bencher-base-ios.json')
    expect(args).not.toContain('--github-actions')
    expect(args).not.toContain('--key')
  })

  test('posts the PR head with the same-run baseline as its start point', () => {
    const args = bencherArguments(
      metadata,
      'android',
      'head',
      '/validated',
      'nitro'
    )
    expect(option(args, '--branch')).toBe('pr-123')
    expect(option(args, '--hash')).toBe(metadata.headSha)
    expect(option(args, '--start-point')).toBe(`baseline-${metadata.baseSha}`)
    expect(option(args, '--start-point-hash')).toBe(metadata.baseSha)
    expect(option(args, '--file')).toBe('/validated/bencher-android.json')
    expect(args).toContain('--start-point-reset')
    expect(args).not.toContain('--key')
  })

  test('main runs do not require a pre-existing baseline', () => {
    const main = {
      ...metadata,
      eventName: 'push',
      pullRequestNumber: null,
    } as const
    const args = bencherArguments(main, 'ios', 'head', '/validated', 'nitro')
    expect(option(args, '--branch')).toBe('main')
    expect(args).not.toContain('--start-point')
    expect(() =>
      bencherArguments(main, 'ios', 'base', '/validated', 'nitro')
    ).toThrow()
  })

  test('rejects missing/duplicate platforms and inconsistent PR metadata', () => {
    expect(validateMetadata(metadata)).toEqual(metadata)
    for (const invalid of [
      { ...metadata, platforms: ['ios', 'ios'] },
      { ...metadata, platforms: [] },
      { ...metadata, pullRequestNumber: null },
      { ...metadata, eventName: 'push' },
      { ...metadata, headSha: 'not-a-sha' },
    ])
      expect(() => validateMetadata(invalid)).toThrow()
  })
})
