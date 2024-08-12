import type { SourceImport } from '../SourceFile.js'

/**
 * Generates C++ code for including a `NitroModules` header.
 * @example `Hash.hpp` -> `#include <NitroModules/Hash.hpp>`
 */
export function includeNitroHeader(headerName: string): string {
  return `
#if __has_include(<NitroModules/${headerName}>)
#include <NitroModules/${headerName}>
#else
#error NitroModules cannot be found! Are you sure you installed NitroModules properly?
#endif
  `.trim()
}

export function includeHeader(sourceImport: SourceImport): string {
  switch (sourceImport.space) {
    case 'user':
      return `#include "${sourceImport.name}"`
    case 'system':
      return `#include <${sourceImport.name}>`
  }
}
