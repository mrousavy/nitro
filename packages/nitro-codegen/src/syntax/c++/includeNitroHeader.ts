/**
 * Generates C++ code for including a `NitroModules` header.
 * @example `'Hash.hpp'` -> `#include "Hash.hpp"`
 */
export function includeNitroHeader(headerName: string): string {
  return `
#if __has_include(<NitroModules/${headerName}>)
#include <NitroModules/${headerName}>
#elif __has_include("${headerName}")
#include "${headerName}"
#else
#error NitroModules cannot be found! Are you sure you installed NitroModules properly?
#endif
  `.trim()
}
