import { promises as fs } from 'fs'
import { prettifyDirectory } from './getCurrentDir.js'

/**
 * Removes the given folder and all its contents if exists
 */
export async function removeFolder(folderPath: string): Promise<void> {
    // check if exists and is a directory
    const hasFolder = await fs.stat(folderPath)
        .then(stat => stat.isDirectory())
        .catch(() => false)

    if (!hasFolder) {
        return Promise.resolve()
    }

    console.log(`🗑️ Removing ${prettifyDirectory(folderPath)}`)

    // Remove directory recursively
    await fs.rm(folderPath, { recursive: true })
}
