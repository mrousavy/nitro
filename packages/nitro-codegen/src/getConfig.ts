import { z, ZodError } from 'zod'
import path from 'path'
import { promises as fs } from 'fs'

// const CXX_BASE_NAMESPACE = ['margelo', 'nitro']
// const ANDROID_BASE_NAMESPACE = ['com', 'margelo', 'nitro']

const ConfigSchema = z.object({
  /**
   * Represents the C++ namespace of the module that will be generated.
   *
   * This can have multiple sub-namespaces, and is always relative to `margelo::nitro`.
   * @example `['image']` -> `margelo::nitro::image`
   */
  cxxNamespace: z.array(z.string()),
  /**
   * iOS specific options.
   */
  ios: z.object({
    /**
     * Represents the iOS module name of the module that will be generated.
     *
     * This will be used to generate Swift bridges, as those are always namespaced within the clang module.
     *
     * If you are using CocoaPods, this should be the Pod name defined in the `.podspec`.
     * @example `NitroImage`
     */
    iosModulename: z.string(),
  }),
  /**
   * Android specific options.
   */
  android: z.object({
    /**
     * Represents the Android namespace ("package") of the module that will be generated.
     *
     * This can have multiple sub-namespaces, and is always relative to `com.margelo.nitro`.
     * @example `['image']` -> `com.margelo.nitro.image`
     */
    androidNamespace: z.array(z.string()),

    /**
     * Returns the name of the Android C++ library (aka name in CMakeLists.txt `add_library(..)`).
     * This will be loaded via `System.loadLibrary(...)`.
     * @example `NitroImage`
     */
    androidCxxLibName: z.string(),
  }),
})

/**
 * Represents the structure of a `nitro.json` config file.
 */
export type NitroConfig = z.infer<typeof ConfigSchema>

function isTopLevelDirectory(directory: string): boolean {
  const up = path.resolve(path.join(directory, '..'))
  return path.resolve(directory) === up
}

// Reads the config, looks up directories recursively
async function readConfig(directory: string): Promise<string> {
  if (isTopLevelDirectory(directory)) {
    throw new Error(
      `No nitro.json file found! Make sure to create a nitro.json file and try again.`
    )
  }

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
      return await readConfig(path.join(directory, '..'))
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

function parseConfig(json: string): NitroConfig {
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
    return ConfigSchema.parse(object)
  } catch (error) {
    if (error instanceof ZodError) {
      const issues = error.issues.map((i) => {
        const prop = propPathToString(i.path)
        if (i.code === 'invalid_type') {
          return `\`${prop}\` must be ${i.expected}, but is ${i.received}.`
        } else {
          return `\`${prop}\`: ${i.message}.`
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

export async function readCurrentConfig(
  directory: string
): Promise<NitroConfig> {
  const json = await readConfig(directory)
  const config = parseConfig(json)
  return config
}
