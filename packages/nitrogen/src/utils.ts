import type { SourceFile } from './syntax/SourceFile.js'
import path from 'path'
import fs from 'fs'
import type { SwiftCxxHelper } from './syntax/swift/SwiftCxxTypeHelper.js'
import type { Type } from 'ts-morph'
import { isNotDuplicate } from './syntax/helpers.js'
import { readUserConfig } from './config/getConfig.js'
import { NitroConfig } from './config/NitroConfig.js'

export function capitalizeName(name: string): string {
  if (name.length === 0) return name
  return name.charAt(0).toUpperCase() + name.slice(1)
}

export function createIndentation(spacesCount: number): string {
  return Array.from(Array(spacesCount)).fill(' ').join('')
}

export function indent(string: string, spacesCount: number): string
export function indent(string: string, indentation: string): string
export function indent(string: string, indentation: string | number): string {
  let spaces: string
  if (typeof indentation === 'number') {
    spaces = createIndentation(indentation)
  } else {
    spaces = indentation
  }
  return string.replaceAll('\n', `\n${spaces}`)
}

export function errorToString(error: unknown): string {
  if (error == null) {
    return `null`
  }
  if (typeof error !== 'object') {
    return `${error}`
  }
  if (error instanceof Error) {
    let message = `${error.name}: ${error.message}`
    if (error.cause != null) {
      message += ` (cause: ${JSON.stringify(error.cause)})`
    }
    return message
  }
  if ('toString' in error) {
    return error.toString()
  }
  return JSON.stringify(error)
}

export function escapeComments(string: string): string {
  return string
    .replace(/\/\*/g, '/ *') // Escape start of comment
    .replace(/\*\//g, '* /') // Escape end of comment
    .replace(/\/\//g, '/ /') // Escape single-line comment
}

const HAS_UNIX_PATHS = path.join('a', 'b').includes('/')
export function toUnixPath(p: string): string {
  if (HAS_UNIX_PATHS) return p
  return p.replaceAll('\\', '/')
}

const sep = path.sep
export function unsafeFastJoin(...segments: string[]): string {
  // this function should really not take any unsafe strings like `/` or `\`.
  return segments.join(sep)
}

function getFullPath(file: SourceFile): string {
  return unsafeFastJoin(
    file.platform,
    file.language,
    ...file.subdirectory,
    file.name
  )
}

/**
 * Deduplicates all files via their full path.
 * If content differs, you are f*cked.
 */
export function deduplicateFiles(files: SourceFile[]): SourceFile[] {
  const map = new Map<string, SourceFile>()
  for (const file of files) {
    const filePath = getFullPath(file)

    if (!map.has(filePath)) {
      map.set(filePath, file)
    }
  }
  return [...map.values()]
}

export function filterDuplicateHelperBridges(
  bridge: SwiftCxxHelper,
  i: number,
  array: SwiftCxxHelper[]
): boolean {
  const otherIndex = array.findIndex(
    (f2) => bridge.specializationName === f2.specializationName
  )
  return otherIndex === i
}

export function toLowerCamelCase(string: string): string {
  const parts = string.split('_').filter((part) => part !== '')

  if (parts.length === 0) return ''

  const camelCaseString = parts[0]!.toLowerCase()

  const camelCased = parts
    .slice(1)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())

  return camelCaseString + camelCased.join('')
}

export function getBaseTypes(type: Type): Type[] {
  const baseTypes = type.getBaseTypes()
  const symbol = type.getSymbol()
  if (symbol != null) {
    baseTypes.push(...symbol.getDeclaredType().getBaseTypes())
  }
  const recursive = baseTypes.flatMap((b) => [b, ...getBaseTypes(b)])
  return recursive.filter(isNotDuplicate)
}

export function getHybridObjectNitroModuleConfig(
  type: Type
): NitroConfig | undefined {
  const symbol = type.getSymbol() ?? type.getAliasSymbol()
  if (!symbol) return undefined

  const declarations =
    symbol.getValueDeclaration() || symbol.getDeclarations()[0]
  if (!declarations) return undefined

  const sourceFile = declarations.getSourceFile()
  let filePath: string = sourceFile.getFilePath()

  while (true) {
    // go up one dir
    const newFilePath = path.resolve(path.join(filePath, '..'))
    if (filePath === newFilePath) {
      // going 'cd ..' in that path didn't change a thing - so we
      // reached the root directory. we didn't find a nitro.json anywhere.
      return undefined
    }
    filePath = newFilePath

    const nitroJsonPath = path.join(filePath, 'nitro.json')
    const hasNitroJson = fs.existsSync(nitroJsonPath)
    if (hasNitroJson) {
      const config = readUserConfig(nitroJsonPath)
      return new NitroConfig(config)
    }
  }
}
