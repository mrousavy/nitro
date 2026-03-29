import { NitroConfig } from '../../config/NitroConfig.js'

/**
 * Path segment for `#include <ModuleName/...>` of headers from this pod.
 */
export function cppModuleScopedImportName(
  relativePathUnderModule: string
): string {
  return `${NitroConfig.current.getIosModuleName()}/${relativePathUnderModule}`
}
