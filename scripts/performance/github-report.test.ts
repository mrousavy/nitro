import { describe, expect, test } from 'bun:test'
import { postPerformanceComment } from './github-report'

const report = {
  repository: 'margelo/nitro',
  pullRequestNumber: 123,
  baseSha: 'a'.repeat(40),
  headSha: 'b'.repeat(40),
  markdown: '## Nitro performance\n\n| Benchmark | Base | Head |',
}
const pullRequest = {
  state: 'open',
  base: { sha: report.baseSha },
  head: { sha: report.headSha },
}
const marker = '<!-- nitro-performance-paired-comparison -->'

describe('paired performance PR comment', () => {
  test('creates a comment without modifying user comments', async () => {
    const writes: unknown[] = []
    const status = await postPerformanceComment(
      report,
      async (endpoint, method = 'GET', body) => {
        if (method !== 'GET') {
          writes.push({ endpoint, method, body })
          return {}
        }
        if (endpoint.includes('/pulls/')) return pullRequest
        return [{ id: 1, body: marker, user: { login: 'user', type: 'User' } }]
      }
    )
    expect(status).toBe('created')
    expect(writes).toEqual([
      {
        endpoint: '/repos/margelo/nitro/issues/123/comments',
        method: 'POST',
        body: { body: `${marker}\n${report.markdown}` },
      },
    ])
  })

  test('updates only the existing paired comparison bot comment', async () => {
    const writes: unknown[] = []
    const status = await postPerformanceComment(
      report,
      async (endpoint, method = 'GET', body) => {
        if (method !== 'GET') {
          writes.push({ endpoint, method, body })
          return {}
        }
        if (endpoint.includes('/pulls/')) return pullRequest
        return [
          {
            id: 2,
            body: `${marker}\nold report`,
            user: { login: 'github-actions[bot]', type: 'Bot' },
          },
        ]
      }
    )
    expect(status).toBe('updated')
    expect(writes).toEqual([
      {
        endpoint: '/repos/margelo/nitro/issues/comments/2',
        method: 'PATCH',
        body: { body: `${marker}\n${report.markdown}` },
      },
    ])
  })

  test('does not post stale results after a PR advances', async () => {
    let requests = 0
    const status = await postPerformanceComment(report, async () => {
      requests++
      return { ...pullRequest, head: { sha: 'c'.repeat(40) } }
    })
    expect(status).toBe('stale')
    expect(requests).toBe(1)
  })
})
