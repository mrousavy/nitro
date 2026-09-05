import { readFile } from 'node:fs/promises'
import {
  compareRuns,
  renderPlatformMarkdown,
  toBencherMetricFormat,
} from './comparison'
import { parseArguments, repeatedArgument, requiredArgument } from './args'
import { validateBenchmarkRun } from './schema'

const argumentsMap = parseArguments(Bun.argv.slice(2))
const baseFiles = repeatedArgument(argumentsMap, 'base')
const headFiles = repeatedArgument(argumentsMap, 'head')
const output = requiredArgument(argumentsMap, 'output')
const markdownOutput = requiredArgument(argumentsMap, 'markdown-output')
const bencherOutput = requiredArgument(argumentsMap, 'bencher-output')
const advisoryMode = argumentsMap.get('mode')?.[0] !== 'enforce'

async function readRun(file: string) {
  return validateBenchmarkRun(JSON.parse(await readFile(file, 'utf8')))
}

const baseRuns = await Promise.all(baseFiles.map(readRun))
const headRuns = await Promise.all(headFiles.map(readRun))
const comparison = compareRuns(baseRuns, headRuns, advisoryMode)

await Promise.all([
  Bun.write(output, `${JSON.stringify(comparison, null, 2)}\n`),
  Bun.write(markdownOutput, `${renderPlatformMarkdown(comparison)}\n`),
  Bun.write(
    bencherOutput,
    `${JSON.stringify(toBencherMetricFormat(headRuns), null, 2)}\n`
  ),
])

if (!advisoryMode && comparison.hasRegression) process.exitCode = 1
