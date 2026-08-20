import fs from 'fs'
import { createRequire } from 'module'
import path from 'path'

const require = createRequire(import.meta.url)

/**
 * Mirrors React Native's `toSwiftName()` (scripts/spm/spm-utils.js), which is
 * how its SwiftPM autolinker names a dependency's package and product when the
 * library does not override it.
 *
 * @example `react-native-nitro-test` -> `ReactNativeNitroTest`
 * @example `@margelo/nitro-image` -> `NitroImage`
 */
function toSwiftName(npmName: string): string {
  return npmName
    .replace(/^@[^/]+\//, '')
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

/**
 * The SwiftPM package/product name React Native's autolinker will resolve this
 * module by.
 *
 * This is NOT the module's Swift module name (that stays `iosModuleName`) — it
 * is the identity of the *package*, which must match what React Native expects
 * or resolution fails with
 *
 *     product 'ReactNativeNitroTest' required by package 'autolinking' ...
 *     not found in package 'ReactNativeNitroTest'
 *
 * React Native derives it from the npm package name, so nitrogen derives it the
 * same way — meaning a module needs no configuration at all to be consumable
 * via SwiftPM. A library that wants a different identity can still override it
 * with `spm.name` in its `react-native.config.js` (React Native's documented
 * escape hatch), and that override is honoured here.
 */
export function getSpmPackageName(packageRoot: string): string | undefined {
  for (const file of ['react-native.config.js', 'react-native.config.cjs']) {
    const configPath = path.join(packageRoot, file)
    if (!fs.existsSync(configPath)) continue
    try {
      const config: unknown = require(configPath)
      const name = (config as { spm?: { name?: unknown } } | undefined)?.spm
        ?.name
      if (typeof name === 'string' && name.length > 0) return name
    } catch {
      // Unreadable config — fall through to the derived name.
    }
    break
  }

  try {
    const packageJson: unknown = JSON.parse(
      fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8')
    )
    const npmName = (packageJson as { name?: unknown } | undefined)?.name
    if (typeof npmName === 'string' && npmName.length > 0) {
      return toSwiftName(npmName)
    }
  } catch {
    // No readable package.json — cannot determine an identity.
  }
  return undefined
}
