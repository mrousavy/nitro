import path from 'path'
import { prettifyDirectory } from './prettifyDirectory.js'
import fs from 'fs/promises'
import { existsSync } from 'fs'
import { Logger } from './Logger.js'
import chalk from 'chalk'
import { execSync } from 'child_process'
import { randomUUID } from 'crypto'

export async function initNewNitroModule(
  baseDirectory: string,
  moduleName: string,
  ref: string = 'main'
): Promise<void> {
  Logger.info(
    `⚙️  Creating new Nitro Module "${chalk.bold(moduleName)}" in ${chalk.underline(prettifyDirectory(baseDirectory))}...`
  )

  const directory = path.join(baseDirectory, moduleName)
  if (existsSync(directory)) {
    Logger.error(
      `❌ A folder named "${chalk.underline(moduleName)}" already exists in the directory ${chalk.underline(prettifyDirectory(baseDirectory))}!`
    )
    process.exit(1)
  }

  await fs.mkdir(directory)

  await downloadGitHubFolder(
    'mrousavy',
    'nitro',
    ref,
    'packages/template',
    directory
  )
  Logger.info(`🏗️ Constructing template...`)

  Logger.info(
    `🎉 Created Nitro Module "${moduleName}" in ${prettifyDirectory(directory)}!`
  )
}

async function isGitInstalled(): Promise<boolean> {
  try {
    execSync('git --version')
    return true
  } catch (error) {
    return false
  }
}

async function downloadGitHubFolder(
  owner: string,
  repo: string,
  branch: string,
  folder: string,
  outputPath: string
): Promise<void> {
  if (!isGitInstalled()) {
    console.error(
      `❌ ${chalk.bold('git')} is not installed or available in the current path! Make sure to install ${chalk.bold('git')} and try again.`
    )
    process.exit(1)
  }

  const repoUrl = `https://github.com/${owner}/${repo}`
  Logger.info(`⏳ Cloning ${chalk.underline(repoUrl)}...`)
  const tempPath = randomUUID()
  const tempDir = path.join(outputPath, tempPath)
  execSync(
    `git clone --depth 1 --filter=blob:none -b ${branch} --quiet --sparse ${repoUrl} ${tempDir}`
  )
  const prettyOutputPath = prettifyDirectory(outputPath)

  const initialDir = process.cwd()
  try {
    process.chdir(tempDir)

    Logger.debug(`⏳ Checking out ${chalk.underline(folder)}...`)
    execSync(`git sparse-checkout set ${folder} --quiet`)

    Logger.debug(
      `📁 Copying files from ${chalk.underline(`${prettyOutputPath}/${tempPath}`)} to ${chalk.underline(prettyOutputPath)}...`
    )
    const sourcePath = path.join(tempDir, folder)
    await fs.mkdir(outputPath, { recursive: true })
    await copyFolder(sourcePath, outputPath)

    Logger.debug(
      `🗑️  Removing temporary folder ${chalk.underline(prettifyDirectory(tempDir))}...`
    )
  } finally {
    // change dir back to original
    process.chdir(initialDir)
  }
}

async function copyFolder(src: string, dest: string) {
  const entries = await fs.readdir(src, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      await fs.mkdir(destPath, { recursive: true })
      await copyFolder(srcPath, destPath)
    } else {
      await fs.copyFile(srcPath, destPath)
    }
  }
}
