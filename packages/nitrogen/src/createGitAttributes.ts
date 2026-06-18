import fs from 'fs/promises'
import path from 'path'

export async function createGitAttributes(
  markAsGenerated: boolean,
  folder: string
): Promise<string> {
  const file = path.join(folder, '.gitattributes')
  // Marks all files in this current folder as "generated"
  const content = `
** linguist-generated=${markAsGenerated}
  `.trim()
  await fs.writeFile(file, content + '\n', 'utf-8')
  return file
}
