import os from 'os'

export function getCurrentDir(allowHomeShorthand = true): string {
  const dir = process.cwd()
  if (!allowHomeShorthand) {
    return dir
  }

  const home = os.homedir()
  const homeShorthand = os.platform() === 'win32' ? '$HOME' : '~'
  return dir.startsWith(home)
    ? `${homeShorthand}${dir.slice(home.length)}`
    : dir
}
