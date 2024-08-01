import { ZodError } from 'zod'
import path from 'path'
import { promises as fs } from 'fs'
import { prettifyDirectory } from '../getCurrentDir.js'
import {
  NitroUserConfigSchema,
  type NitroUserConfig,
} from './NitroUserConfig.js'

async function readFile(directory: string): Promise<string> {
  try {
    return await fs.readFile(path.join(directory, 'nitro.json'), 'utf8')
  } catch (error) {
    if (
      typeof error === 'object' &&
      error != null &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      // this directory doesn't contain a nitro.json config - go up one directory and try again
      throw new Error(
        `No nitro.json config exists at ${prettifyDirectory(directory)}! Create a nitro.json file and try again.`
      )
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

export async function readUserConfig(
  directory: string
): Promise<NitroUserConfig> {
  const json = await readFile(directory)
  const config = parseConfig(json)
  return config
}
