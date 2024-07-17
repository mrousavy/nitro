import os from 'os'
import fs from 'fs'
import path from 'path'

export function getBaseDirectory(): string {
  const customDirectory = process.argv[2]
  if (customDirectory != null && fs.existsSync(customDirectory)) {
    // custom passed in path exists!
    return customDirectory
  }
  return process.cwd()
}

export function prettifyDirectory(directory: string): string {
  const relativePath = path.relative(getBaseDirectory(), directory)

  const home = os.homedir()
  const homeShorthand = os.platform() === 'win32' ? '$HOME' : '~'
  const prettifiedHomeShorthand = directory.startsWith(home)
    ? `${homeShorthand}${directory.slice(home.length)}`
    : directory

  if (relativePath.length < 1) {
    return prettifiedHomeShorthand
  }
  if (prettifiedHomeShorthand.length < 1) {
    return relativePath
  }

  if (prettifiedHomeShorthand.length < relativePath.length) {
    return prettifiedHomeShorthand
  } else {
    return relativePath
  }
}
