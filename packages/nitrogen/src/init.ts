import path from 'path'
import { prettifyDirectory } from './prettifyDirectory.js'
import fs from 'fs/promises'
import { existsSync } from 'fs'
import { Logger } from './Logger.js'
import chalk from 'chalk'

export async function initNewNitroModule(
  baseDirectory: string,
  moduleName: string,
  ref: string = 'main'
): Promise<void> {
  Logger.info(
    `⚙️  Creating new Nitro Module "${moduleName}" in ${prettifyDirectory(baseDirectory)}...`
  )

  const directory = path.join(baseDirectory, moduleName)
  if (existsSync(directory)) {
    Logger.error(
      `❌ A folder named "${moduleName}" already exists in the directory ${prettifyDirectory(baseDirectory)}!`
    )
    process.exit(1)
  }

  await fs.mkdir(directory)

  Logger.info(
    `⏳ Downloading ${chalk.underline('https://github.com/mrousavy/nitro/tree/main/packages/template')}...`
  )
  await downloadGitHubFolder(
    'mrousavy',
    'nitro',
    ref,
    'packages/template',
    directory
  )

  Logger.info(
    `🎉 Created Nitro Module "${moduleName}" in ${prettifyDirectory(directory)}!`
  )
}

interface GitHubFile {
  type: 'file' | 'dir'
  download_url: string
  path: string
}

async function downloadGitHubFolder(
  owner: string,
  repo: string,
  branch: string,
  folder: string,
  outputPath: string
): Promise<void> {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${folder}?ref=${branch}`

  try {
    Logger.debug(
      `⏳ Fetching contents of ${chalk.underline(`https://github.com/tree/${branch}/${folder}`)}...`
    )
    const response = await fetch(apiUrl, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    })

    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`)
    }

    const files = (await response.json()) as GitHubFile[]

    for (const file of files) {
      const filePath = path.join(outputPath, file.path)
      if (file.type === 'file') {
        Logger.debug(`⏳ Downloading ${file.download_url}...`)
        const fileResponse = await fetch(file.download_url)

        if (!fileResponse.ok) {
          throw new Error(
            `Failed to download ${file.download_url}: ${fileResponse.statusText}`
          )
        }

        const fileData = await fileResponse.text()

        await fs.mkdir(path.dirname(filePath), { recursive: true })
        await fs.writeFile(filePath, fileData)
      } else if (file.type === 'dir') {
        await downloadGitHubFolder(owner, repo, branch, file.path, outputPath)
      }
    }
  } catch (error) {
    Logger.error(`❌ Failed to download folder from GitHub!`, error)
    process.exit(1)
  }
}
