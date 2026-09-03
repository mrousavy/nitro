import path from 'node:path'
import { parseArguments, requiredArgument } from './args'

async function command(
  executable: string,
  argumentsList: string[],
  allowFailure = false
): Promise<void> {
  const child = Bun.spawn([executable, ...argumentsList], {
    stdout: 'inherit',
    stderr: 'inherit',
  })
  const exitCode = await child.exited
  if (exitCode !== 0 && !allowFailure) {
    throw new Error(
      `${executable} ${argumentsList.join(' ')} failed with exit code ${exitCode}.`
    )
  }
}

async function commandOutput(
  executable: string,
  argumentsList: string[]
): Promise<{ exitCode: number; output: string }> {
  const child = Bun.spawn([executable, ...argumentsList], {
    stdout: 'pipe',
    stderr: 'ignore',
  })
  const [exitCode, output] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
  ])
  return { exitCode, output }
}

const argumentsMap = parseArguments(Bun.argv.slice(2))
const platform = requiredArgument(argumentsMap, 'platform')
if (platform !== 'android' && platform !== 'ios') {
  throw new Error('--platform must be android or ios.')
}
const app = path.resolve(requiredArgument(argumentsMap, 'app'))
const output = path.resolve(requiredArgument(argumentsMap, 'output'))
const deviceId = requiredArgument(argumentsMap, 'device-id')
const receiverArguments = [
  path.join(import.meta.dir, 'receive.ts'),
  '--output',
  output,
  '--platform',
  platform,
  '--run-id',
  requiredArgument(argumentsMap, 'run-id'),
  '--reverse',
  requiredArgument(argumentsMap, 'reverse'),
  '--commit-sha',
  requiredArgument(argumentsMap, 'commit-sha'),
  '--suite-hash',
  requiredArgument(argumentsMap, 'suite-hash'),
  '--device',
  requiredArgument(argumentsMap, 'device'),
  '--os-version',
  requiredArgument(argumentsMap, 'os-version'),
  '--architecture',
  requiredArgument(argumentsMap, 'architecture'),
  '--toolchain',
  requiredArgument(argumentsMap, 'toolchain'),
]

const receiver = Bun.spawn(['bun', ...receiverArguments], {
  stdout: 'inherit',
  stderr: 'inherit',
})
let monitorCancelled = false

async function monitorAndroidProcess(): Promise<void> {
  await Bun.sleep(1_000)
  while (!monitorCancelled) {
    const process = await commandOutput('adb', [
      '-s',
      deviceId,
      'shell',
      'pidof',
      'com.margelo.nitroexample',
    ])
    if (process.exitCode !== 0 || process.output.trim().length === 0) {
      throw new Error('Android benchmark app stopped before reporting results.')
    }
    await Bun.sleep(1_000)
  }
}

try {
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      const response = await fetch('http://127.0.0.1:8173/config')
      if (response.ok) break
    } catch {
      if (attempt === 49) throw new Error('Benchmark receiver did not start.')
    }
    await Bun.sleep(100)
  }

  if (platform === 'android') {
    const packageName = 'com.margelo.nitroexample'
    await command('adb', ['-s', deviceId, 'uninstall', packageName], true)
    await command('adb', ['-s', deviceId, 'install', '-r', app])
    await command('adb', ['-s', deviceId, 'reverse', 'tcp:8173', 'tcp:8173'])
    await command('adb', [
      '-s',
      deviceId,
      'shell',
      'am',
      'start',
      '-W',
      '-n',
      `${packageName}/.MainActivity`,
    ])
  } else {
    const bundleIdentifier = 'com.margelo.nitro.example.benchmarks'
    await command(
      'xcrun',
      ['simctl', 'terminate', deviceId, bundleIdentifier],
      true
    )
    await command(
      'xcrun',
      ['simctl', 'uninstall', deviceId, bundleIdentifier],
      true
    )
    await command('xcrun', ['simctl', 'install', deviceId, app])
    await command('xcrun', [
      'simctl',
      'launch',
      '--terminate-running-process',
      deviceId,
      bundleIdentifier,
    ])
  }

  const receiverCompletion = receiver.exited.then((receiverExitCode) => {
    if (receiverExitCode !== 0) {
      throw new Error(
        `Benchmark receiver failed with exit code ${receiverExitCode}.`
      )
    }
  })
  await (platform === 'android'
    ? Promise.race([receiverCompletion, monitorAndroidProcess()])
    : receiverCompletion)
} finally {
  monitorCancelled = true
  if (platform === 'android') {
    await command(
      'adb',
      ['-s', deviceId, 'shell', 'am', 'force-stop', 'com.margelo.nitroexample'],
      true
    )
  } else {
    await command(
      'xcrun',
      ['simctl', 'terminate', deviceId, 'com.margelo.nitro.example.benchmarks'],
      true
    )
  }
  receiver.kill()
}
