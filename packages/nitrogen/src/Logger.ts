export type LogLevel = 'debug' | 'info' | 'warning' | 'error'
const levelMap = {
  debug: 0,
  info: 1,
  warning: 2,
  error: 3,
} as const
let currentLogLevel: LogLevel = 'info'

export function isValidLogLevel(level: unknown): level is LogLevel {
  // @ts-expect-error
  return typeof levelMap[level] === 'number'
}

export function setLogLevel(level: LogLevel) {
  currentLogLevel = level
}

function isAtLeast(level: LogLevel): boolean {
  return levelMap[level] >= levelMap[currentLogLevel]
}

let indentation = 0

function getIndentation(): string {
  let string = ''
  for (let i = 0; i < indentation; i++) {
    string += '  '
  }
  return string
}

export interface GenerationError {
  typeName: string
  error: string
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

  summary: {
    success(successCount: number, totalCount: number) {
      console.log(
        `\n✅  All specs generated successfully (${successCount}/${totalCount})\n`
      )
    },

    failure(errors: GenerationError[], successCount: number) {
      console.log(`\n❌  Nitrogen generation failed\n`)

      for (const { typeName, error } of errors) {
        const errorPreview =
          (error ?? 'Unknown error').split('\n')[0]?.substring(0, 80) ??
          'Unknown error'
        console.log(`    • ${typeName}: ${errorPreview}`)
      }

      if (successCount > 0) {
        console.log(
          `\n    ${successCount} spec${successCount === 1 ? '' : 's'} succeeded`
        )
      }
      console.log('')
    },
  },
}
