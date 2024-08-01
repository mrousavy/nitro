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

export const Logger = {
  debug(message: unknown, ...extra: unknown[]) {
    if (isAtLeast('debug')) {
      console.debug(message, ...extra)
    }
  },
  info(message: unknown, ...extra: unknown[]) {
    if (isAtLeast('info')) {
      console.info(message, ...extra)
    }
  },
  warn(message: unknown, ...extra: unknown[]) {
    if (isAtLeast('warning')) {
      console.warn(message, ...extra)
    }
  },
  error(message: unknown, ...extra: unknown[]) {
    if (isAtLeast('error')) {
      console.error(message, ...extra)
    }
  },
}
