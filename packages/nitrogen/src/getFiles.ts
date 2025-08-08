import { Dirent, promises as fs } from 'fs'
import { unsafeFastJoin } from './utils.js'

function getFilePath(file: Dirent, rootDir: string): string {
  const dir = file.parentPath ?? file.path ?? rootDir
  return unsafeFastJoin(dir, file.name)
}

export async function getFiles(directory: string): Promise<string[]> {
  try {
    const files = await fs.readdir(directory, {
      recursive: true,
      withFileTypes: true,
    })

    return files.filter((f) => f.isFile()).map((f) => getFilePath(f, directory))
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
