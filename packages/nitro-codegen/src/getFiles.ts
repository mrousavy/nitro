import { promises as fs } from 'fs'
import path from 'path'

export async function getFiles(directory: string): Promise<string[]> {
  const files = await fs.readdir(directory, {
    recursive: true,
  })

  const filtered = files.map(async (f) => {
    const file = path.join(directory, f)
    const stat = await fs.stat(file)
    if (stat.isDirectory()) {
      return undefined
    }
    return file
  })
  const all = await Promise.all(filtered)
  return all.filter((v) => v != null)
}
