import { NitroConfig } from './config/NitroConfig.js'
import type { NitroUserConfig } from './config/NitroUserConfig.js'

type LogLevel = NitroUserConfig['logLevel']
const levelMap: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warning: 2,
  error: 3,
}

function isAtLeast(level: NitroUserConfig['logLevel']): boolean {
  const current = NitroConfig.getLogLevel()
  return levelMap[level] >= levelMap[current]
}

let indentation = 0

function getIndentation(): string {
  let string = ''
  for (let i = 0; i < indentation; i++) {
    string += '  '
  }
  return string
}

export const Logger = {
  withIndented(callback: () => void) {
    try {
      indentation++
      callback()
    } finally {
      indentation--
    }
  },

  debug(message: string, ...extra: unknown[]) {
    if (isAtLeast('debug')) {
      console.debug(getIndentation() + message, ...extra)
    }
  },
  info(message: string, ...extra: unknown[]) {
    if (isAtLeast('info')) {
      console.info(getIndentation() + message, ...extra)
    }
  },
  warn(message: string, ...extra: unknown[]) {
    if (isAtLeast('warning')) {
      console.warn(getIndentation() + message, ...extra)
    }
  },
  error(message: string, ...extra: unknown[]) {
    if (isAtLeast('error')) {
      console.error(getIndentation() + message, ...extra)
    }
  },
}
