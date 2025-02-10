import fs from 'fs/promises'
import path from 'path'

export async function createGitAttributes(folder: string): Promise<string> {
  const file = path.join(folder, '.gitattributes')
  // Marks all files in this current folder as "generated"
  await fs.writeFile(file, `* linguist-generated`)
  return file
}
