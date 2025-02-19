import fs from 'fs/promises'
import path from 'path'

const GIT_ATTRIBUTES_CONTENT = `
* linguist-generated
`

export async function createGitAttributes(folder: string): Promise<string> {
  const file = path.join(folder, '.gitattributes')
  // Marks all files in this current folder as "generated"
  await fs.writeFile(file, GIT_ATTRIBUTES_CONTENT.trim() + '\n', 'utf-8')
  return file
}
