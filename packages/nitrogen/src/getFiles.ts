import { promises as fs } from 'fs'
import path from 'path'

export async function getFiles(directory: string): Promise<string[]> {
  try {
    const files = await fs.readdir(directory, {
      recursive: true,
      withFileTypes: true,
    })

    return files.filter((f) => f.isFile()).map((f) => path.join(f.path, f.name))
  } catch (error) {
    if (
      typeof error === 'object' &&
      error != null &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      // directory does not exist
      return []
    } else {
      // different error
      throw error
    }
  }
}
