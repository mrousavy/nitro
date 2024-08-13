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

export function includeHeader(
  sourceImport: SourceImport,
  force = true
): string {
  const header = getHeader(sourceImport.name, sourceImport.space)
  if (force) {
    return `#include ${header}`
  } else {
    return `
#if __has_include(${header})
 #include ${header}
#endif
    `.trim()
  }
}

function getHeader(name: string, space: 'user' | 'system'): string {
  switch (space) {
    case 'user':
      return `"${name}"`
    case 'system':
      return `<${name}>`
  }
}
