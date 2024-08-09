import os from 'os'
import path from 'path'

export function prettifyDirectory(directory: string): string {
  let relativePath = path.relative(process.cwd(), path.resolve(directory))
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
