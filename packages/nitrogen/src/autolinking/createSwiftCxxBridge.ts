import { NitroConfig } from '../config/NitroConfig.js'
import { includeHeader } from '../syntax/c++/includeNitroHeader.js'
import { getAllKnownTypes } from '../syntax/createType.js'
import { createFileMetadataString, isNotDuplicate } from '../syntax/helpers.js'
import type { SourceFile } from '../syntax/SourceFile.js'
import { SwiftCxxBridgedType } from '../syntax/swift/SwiftCxxBridgedType.js'
import { indent } from '../utils.js'

export function createSwiftCxxBridge(): SourceFile[] {
  const moduleName = NitroConfig.getIosModuleName()
  const bridgeName = `${moduleName}-Swift-Cxx-Bridge`

  const types = getAllKnownTypes().map((t) => new SwiftCxxBridgedType(t))

  const bridges = types.flatMap((t) => t.getRequiredBridges())
  const helperFunctions = bridges
    .map((b) => b.cxxCode)
    .filter(isNotDuplicate)
    .join('\n\n')

  const requiredImports = bridges.flatMap((b) => b.requiredIncludes)
  const includes = requiredImports
    .map((i) => includeHeader(i))
    .filter(isNotDuplicate)
  const forwardDeclarations = requiredImports
    .map((i) => i.forwardDeclaration)
    .filter((f) => f != null)
    .filter(isNotDuplicate)
  const namespace = NitroConfig.getCxxNamespace('c++')

  const header = `
${createFileMetadataString(`${bridgeName}.hpp`)}

#pragma once

// Forward declarations of C++ defined types
${forwardDeclarations.sort().join('\n')}

// Include C++ defined types
${includes.sort().join('\n')}

namespace ${namespace} {

  ${indent(helperFunctions, '  ')}

} // namespace ${namespace}
`

  const source = `
${createFileMetadataString(`${bridgeName}.cpp`)}

#include "${bridgeName}.hpp"
`

  const files: SourceFile[] = []
  files.push({
    content: header,
    language: 'c++',
    name: `${bridgeName}.hpp`,
    platform: 'ios',
    subdirectory: [],
  })
  files.push({
    content: source,
    language: 'c++',
    name: `${bridgeName}.cpp`,
    platform: 'ios',
    subdirectory: [],
  })
  return files
}
