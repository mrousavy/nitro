import { z } from 'zod'
import { capitalizeName } from '../utils.js'
import path from 'path'
import { promises as fs } from 'fs'

// Namespaces and package names in C++/Java will be matched with a regex.
const safeNamePattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/

export const NitroUserConfigSchema = z.object({
  /**
   * Represents the C++ namespace of the module that will be generated.
   *
   * This can have multiple sub-namespaces, and is always relative to `margelo::nitro`.
   * @example `['image']` -> `margelo::nitro::image`
   */
  cxxNamespace: z.array(z.string().regex(safeNamePattern)).min(1),
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
    iosModulename: z.string().regex(safeNamePattern),
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
    androidNamespace: z.array(z.string().regex(safeNamePattern)).min(1),

    /**
     * Returns the name of the Android C++ library (aka name in CMakeLists.txt `add_library(..)`).
     * This will be loaded via `System.loadLibrary(...)`.
     * @example `NitroImage`
     */
    androidCxxLibName: z.string().regex(safeNamePattern),
  }),
  /**
   * Configures the code that gets generated for autolinking (registering)
   * Hybrid Object constructors.
   *
   * Each class listed here needs to have a default constructor/initializer that takes
   * zero arguments.
   */
  autolinking: z.record(
    z.string(),
    z.object({
      cpp: z.string().optional(),
      swift: z.string().optional(),
      kotlin: z.string().optional(),
    })
  ),
  /**
   * A list of paths relative to the project directory that should be ignored by nitrogen.
   * Nitrogen will not look for `.nitro.ts` files in these directories.
   */
  ignorePaths: z.array(z.string()).optional(),
})

/**
 * Represents the structure of a `nitro.json` config file.
 */
export type NitroUserConfig = z.infer<typeof NitroUserConfigSchema>

export function writeUserConfigFile(
  moduleName: string,
  directory: string
): Promise<void> {
  const config: NitroUserConfig = {
    android: {
      androidCxxLibName: `Nitro${capitalizeName(moduleName)}`,
      androidNamespace: [moduleName.toLowerCase()],
    },
    cxxNamespace: [moduleName.toLowerCase()],
    ios: {
      iosModulename: `Nitro${capitalizeName(moduleName)}`,
    },
    autolinking: {},
  }
  const dir = path.join(directory, 'nitro.json')
  return fs.writeFile(dir, JSON.stringify(config, null, 2))
}
