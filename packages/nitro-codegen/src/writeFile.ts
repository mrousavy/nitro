import path from 'path'
import { promises as fs } from 'fs'
import { capitalizeName } from './stringUtils.js'
import type { SourceFile } from './syntax/SourceFile.js'

export async function writeFile(
  basePath: string,
  file: SourceFile
): Promise<void> {
  const filepath = path.join(basePath, file.name)
  const language = capitalizeName(file.language)
  console.log(`          ${language}: Creating ${file.name}...`)

  const dir = path.dirname(filepath)
  // Create directory if it doesn't exist yet
  await fs.mkdir(dir, { recursive: true })

  // Write file
  await fs.writeFile(filepath, file.content.trim(), 'utf8')
}
