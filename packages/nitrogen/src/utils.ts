import type { SourceFile } from './syntax/SourceFile.js'
import path from 'path'

export function capitalizeName(name: string): string {
  if (name.length === 0) return name
  return name.charAt(0).toUpperCase() + name.slice(1)
}

export function indent(string: string, indentation: string): string {
  return string.replaceAll('\n', `\n${indentation}`)
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
