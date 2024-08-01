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
  let relativePath = path.relative(getBaseDirectory(), directory)
  if (!relativePath.startsWith('.') && relativePath.length > 0) {
    // Make sure all relative paths start with "./something", not just "something"
    relativePath = `./${relativePath}`
  }

  const home = os.homedir()
  const homeShorthand = os.platform() === 'win32' ? '$HOME' : '~'
  const prettifiedHomeShorthand = directory.startsWith(home)
    ? `${homeShorthand}${directory.slice(home.length)}`
    : directory

  if (relativePath.length < 1) {
    // If relativePath is ".", we don't want to return it
    return prettifiedHomeShorthand
  }

  if (
    relativePath.length > 0 &&
    relativePath.length < prettifiedHomeShorthand.length
  ) {
    // If relativePath is shroter than the ~/... home path, we use the relative one.
    return relativePath
  } else {
    // ..otherwise just use the ~/... home relative path.
    return prettifiedHomeShorthand
  }
}
