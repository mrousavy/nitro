import os from 'os'
import fs from 'fs'

function getCustomOrCurrentDir(): string {
  const customDirectory = process.argv[2]
  if (customDirectory != null && fs.existsSync(customDirectory)) {
    // custom passed in path exists!
    return customDirectory
  }
  return process.cwd()
}

export function getCurrentDir(allowHomeShorthand = true): string {
  const dir = getCustomOrCurrentDir()
  if (!allowHomeShorthand) {
    return dir
  }

  const home = os.homedir()
  const homeShorthand = os.platform() === 'win32' ? '$HOME' : '~'
  return dir.startsWith(home)
    ? `${homeShorthand}${dir.slice(home.length)}`
    : dir
}
