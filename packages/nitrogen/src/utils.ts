import type { SourceFile } from './syntax/SourceFile.js'
import path from 'path'
import type { SwiftCxxHelper } from './syntax/swift/SwiftCxxTypeHelper.js'
import type { Type } from 'ts-morph'
import { isNotDuplicate } from './syntax/helpers.js'

export const NITROGEN_VERSION = process.env.npm_package_version ?? '?.?.?'

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

function getFullPath(file: SourceFile): string {
  return path.join(
    file.platform,
    file.language,
    ...file.subdirectory,
    file.content
  )
}
export function filterDuplicateFiles(
  f: SourceFile,
  i: number,
  array: SourceFile[]
): boolean {
  const otherIndex = array.findIndex((f2) => getFullPath(f) === getFullPath(f2))
  if (otherIndex !== i) {
    if (array[i]?.content !== array[otherIndex]?.content) {
      throw new Error(`File "${f.name}"'s content differs!`)
    }
  }
  return otherIndex === i
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
