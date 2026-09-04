import { expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'

test('Android performance CI requires KVM and cannot fall back to software emulation', async () => {
  const source = await readFile(
    new URL('../../.github/workflows/performance.yml', import.meta.url),
    'utf8'
  )
  const workflow = Bun.YAML.parse(source) as {
    jobs: {
      android: {
        steps: {
          name?: string
          run?: string
          with?: Record<string, unknown>
        }[]
      }
    }
  }
  const steps = workflow.jobs.android.steps
  const kvmIndex = steps.findIndex(
    (step) => step.name === 'Enable KVM for benchmark measurements'
  )
  const buildIndex = steps.findIndex(
    (step) => step.name === 'Build head benchmark APK'
  )
  expect(kvmIndex).toBeGreaterThanOrEqual(0)
  expect(kvmIndex).toBeLessThan(buildIndex)
  expect(steps[kvmIndex]?.run).toContain('test -c /dev/kvm')
  expect(steps[kvmIndex]?.run).toContain('test -r /dev/kvm && test -w /dev/kvm')
  const kvmScript = steps[kvmIndex]!.run!
  expect(kvmScript.indexOf('udevadm settle --timeout=30')).toBeGreaterThan(
    kvmScript.indexOf('udevadm trigger')
  )
  expect(kvmScript.indexOf('udevadm settle --timeout=30')).toBeLessThan(
    kvmScript.indexOf('test -r /dev/kvm')
  )

  const emulator = steps.find(
    (step) => step.name === 'Run paired Android benchmarks'
  )?.with
  expect(emulator?.['disable-linux-hw-accel']).toBe(false)
  expect(emulator?.['pre-emulator-launch-script']).toContain('-accel-check')
  expect(emulator?.['emulator-options']).toContain('-accel on')
  expect(emulator?.['emulator-options']).toContain('-no-snapshot')
  expect(emulator?.['script']).toContain('/ KVM')
})

test('pre-merge publishing uses pinned code on a separate, same-repository-only job', async () => {
  const workflow = Bun.YAML.parse(
    await readFile(
      new URL('../../.github/workflows/performance.yml', import.meta.url),
      'utf8'
    )
  ) as any
  const job = workflow.jobs['publish-pr']
  expect(job.needs).toEqual(['prepare', 'nitro-performance'])
  expect(job.if).toContain("github.event_name == 'pull_request'")
  expect(job.if).toContain(
    'github.event.pull_request.head.repo.full_name == github.repository'
  )
  expect(job.if).toContain(
    "needs.prepare.outputs.base_benchmark_available == 'true'"
  )
  expect(workflow.permissions).toEqual({ contents: 'read' })
  expect(job.permissions['checks']).toBe('write')
  const checkout = job.steps.find(
    (s: any) => s.name === 'Checkout pinned reporting code'
  )
  expect(checkout.with.ref).toMatch(/^[0-9a-f]{40}$/)
  expect(checkout.with['persist-credentials']).toBe(false)
  expect(JSON.stringify(job)).not.toContain('pull_request.head.sha')
  expect(JSON.stringify(job)).not.toContain('bun install')
  const comment = job.steps.find(
    (s: any) => s.name === 'Post paired comparison to the PR'
  )
  expect(comment.if).toBeUndefined()
  const bencher = job.steps.find(
    (s: any) => s.name === 'Install pinned Bencher CLI'
  )
  expect(bencher.with.version).toBe('0.6.12')
  const publish = job.steps.find(
    (s: any) => s.name === 'Publish to Bencher and GitHub'
  )
  expect(publish.env.BENCHER_API_KEY).toBe('${{ secrets.BENCHER_KEY }}')
  for (const name of ['prepare', 'android', 'ios', 'nitro-performance']) {
    expect(JSON.stringify(workflow.jobs[name])).not.toContain(
      'secrets.BENCHER_KEY'
    )
  }
})

test('default-branch reporter handles forks without duplicating same-repository PR reports', async () => {
  const workflow = Bun.YAML.parse(
    await readFile(
      new URL(
        '../../.github/workflows/performance-report.yml',
        import.meta.url
      ),
      'utf8'
    )
  ) as any
  expect(workflow.jobs.publish.if).toContain(
    "github.event.workflow_run.event != 'pull_request'"
  )
  expect(workflow.jobs.publish.if).toContain(
    'github.event.workflow_run.head_repository.full_name != github.repository'
  )
  const bencher = workflow.jobs.publish.steps.find(
    (s: any) => s.name === 'Install Bencher CLI'
  )
  expect(bencher.with.version).toBe('0.6.12')
})
