import { ZodError } from 'zod'
import fs from 'fs'
import {
  NitroUserConfigSchema,
  type NitroUserConfig,
} from './NitroUserConfig.js'
import chalk from 'chalk'

function readFile(configPath: string): string {
  try {
    return fs.readFileSync(configPath, 'utf8')
  } catch (error) {
    if (typeof error === 'object' && error != null && 'code' in error) {
      switch (error.code) {
        case 'ENOENT':
        case 'ENOTDIR':
          // this directory doesn't contain a nitro.json config - go up one directory and try again
          throw new Error(
            `The path ${chalk.underline(configPath)} does not exist! Create a ${chalk.underline('nitro.json')} file and try again.`
          )
        default:
          throw error
      }
    } else {
      // different kind of error, throw it.
      throw error
    }
  }
}

function propPathToString(propPath: (string | number)[]): string {
  if (propPath.length === 0) return ''
  const prop = propPath.reduce<string>((prev, curr) => {
    if (typeof curr === 'string') {
      return `${prev}.${curr}`
    } else if (typeof curr === 'number') {
      return `${prev}[${curr}]`
    } else {
      return prev
    }
  }, '')
  return prop.slice(1)
}

function parseConfig(json: string): NitroUserConfig {
  let object: unknown
  try {
    object = JSON.parse(json)
  } catch (error) {
    throw new Error(
      `Failed to parse nitro.json config as JSON! Make sure it has a valid JSON syntax. JSON: ${json}`,
      {
        cause: error,
      }
    )
  }

  try {
    return NitroUserConfigSchema.parse(object)
  } catch (error) {
    if (error instanceof ZodError) {
      const issues = error.issues.map((i) => {
        const prop = propPathToString(i.path)
        switch (i.code) {
          case 'invalid_type':
            return `\`${prop}\` must be ${i.expected}, but is ${i.received}.`
          case 'invalid_string':
            return `\`${prop}\` is not a valid & safe string. It must only contain alphanumeric characters and must not start with a number.`
          default:
            return `\`${prop}\`: ${i.message} (${i.code})`
        }
      })
      throw new Error(
        `Invalid nitro.json config file! ${issues.join(' - also, ')}`
      )
    } else {
      throw error
    }
  }
}

export function readUserConfig(configPath: string): NitroUserConfig {
  const json = readFile(configPath)
  const config = parseConfig(json)
  return config
}
