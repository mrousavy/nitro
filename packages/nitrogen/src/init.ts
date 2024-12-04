import path from 'path'
import { prettifyDirectory } from './prettifyDirectory.js'
import fs from 'fs/promises'

export async function initNewNitroModule(
  baseDirectory: string,
  moduleName: string
): Promise<void> {
  console.log(
    `⚙️ Creating new Nitro Module "${moduleName}" in ${prettifyDirectory(baseDirectory)}...`
  )

  const directory = path.join(baseDirectory, moduleName)
  const stat = await fs.stat(directory)
  if (stat.isDirectory()) {
    throw new Error(
      `A folder named "${moduleName}" already exists in the directory ${prettifyDirectory(baseDirectory)}!`
    )
  }

  await fs.mkdir(directory)

  console.log(
    `🎉 Created Nitro Module "${moduleName}" in ${prettifyDirectory(directory)}!`
  )
}
