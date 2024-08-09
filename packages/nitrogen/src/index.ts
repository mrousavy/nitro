#!/usr/bin/env node

import { promises as fs } from 'fs'
import path from 'path'
import { getBaseDirectory, prettifyDirectory } from './getCurrentDir.js'
import chalk from 'chalk'
import { runNitrogen } from './nitrogen.js'
import { getFiles } from './getFiles.js'

// 1. Prepare output folders
const baseDirectory = getBaseDirectory()
const outputDirectory = path.join(baseDirectory, 'nitrogen', 'generated')
const filesBefore = await getFiles(outputDirectory)

const start = performance.now()

// 2. Run Nitrogen
const { generatedFiles, generatedSpecsCount, targetSpecsCount } =
  await runNitrogen({
    baseDirectory: baseDirectory,
    outputDirectory: outputDirectory,
  })

const end = performance.now()
const timeS = ((end - start) / 1000).toFixed(1)
console.log(
  `🎉  Generated ${generatedSpecsCount}/${targetSpecsCount} HybridObject${generatedSpecsCount === 1 ? '' : 's'} in ${timeS}s!`
)
console.log(
  `💡  Your code is in ${chalk.underline(prettifyDirectory(outputDirectory))}`
)

// 3. Delete all old dangling files
const addedFiles = generatedFiles.filter((f) => !filesBefore.includes(f))
const removedFiles = filesBefore.filter((f) => !generatedFiles.includes(f))
if (addedFiles.length > 0 || removedFiles.length > 0) {
  let text = ''
  const as = addedFiles.length > 1 ? 's' : ''
  const rs = removedFiles.length > 1 ? 's' : ''
  if (addedFiles.length > 0 && removedFiles.length === 0) {
    text = `Added ${addedFiles.length} file${as}`
  } else if (addedFiles.length === 0 && removedFiles.length > 0) {
    text = `Removed ${removedFiles.length} file${rs}`
  } else {
    text = `Added ${addedFiles.length} file${as} and removed ${removedFiles.length} file${rs}`
  }

  console.log(
    `‼️   ${text} - ${chalk.bold('you need to run `pod install`/sync gradle to update files!')}`
  )
}
const promises = removedFiles.map(async (file) => {
  const stat = await fs.stat(file)
  if (stat.isFile()) {
    await fs.rm(file)
  }
})
await Promise.all(promises)
