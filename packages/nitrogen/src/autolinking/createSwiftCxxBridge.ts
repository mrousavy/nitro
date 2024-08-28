import { NitroConfig } from '../config/NitroConfig.js'
import { includeHeader } from '../syntax/c++/includeNitroHeader.js'
import { getAllKnownTypes } from '../syntax/createType.js'
import { createFileMetadataString, isNotDuplicate } from '../syntax/helpers.js'
import type { SourceFile } from '../syntax/SourceFile.js'
import { getReferencedTypes } from '../syntax/getReferencedTypes.js'
import { SwiftCxxBridgedType } from '../syntax/swift/SwiftCxxBridgedType.js'
import { filterDuplicateHelperBridges, indent } from '../utils.js'
import { BRIDGE_NAMESPACE } from '../syntax/swift/SwiftHybridObjectBridge.js'

const SWIFT_BRIDGE_NAMESPACE = ['bridge', 'swift']

export function createSwiftCxxBridge(): SourceFile[] {
  const moduleName = NitroConfig.getIosModuleName()
  const bridgeName = `${moduleName}-Swift-Cxx-Bridge`

  const allTypes = getAllKnownTypes()

  const bridges = allTypes
    .map((t) => new SwiftCxxBridgedType(t))
    .flatMap((t) => {
      const referenced = getReferencedTypes(t.type)
      return referenced.map((r) => {
        const bridge = new SwiftCxxBridgedType(r)
        return bridge.getRequiredBridge()
      })
    })
    .filter((b) => b != null)
    .filter(filterDuplicateHelperBridges)
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
  const namespace = NitroConfig.getCxxNamespace(
    'c++',
    ...SWIFT_BRIDGE_NAMESPACE
  )

  const header = `
${createFileMetadataString(`${bridgeName}.hpp`)}

#pragma once

// Forward declarations of C++ defined types
${forwardDeclarations.sort().join('\n')}

// Include C++ defined types
${includes.sort().join('\n')}

/**
 * Contains specialized versions of C++ templated types so they can be accessed from Swift,
 * as well as helper functions to interact with those C++ types from Swift.
 */
namespace ${namespace} {

  ${indent(helperFunctions, '  ')}

} // namespace ${namespace}
`

  const source = `
${createFileMetadataString(`${bridgeName}.cpp`)}

#include "${bridgeName}.hpp"
`

  const swiftBridges = allTypes
    .map((t) => new SwiftCxxBridgedType(t, true))
    .map((t) => createSwiftBridge(t))
    .filter(isNotDuplicate)
    .filter((c) => c != null)
    .join('\n\n')
  const swiftCode = `
${createFileMetadataString(`${bridgeName}.swift`)}

import NitroModules

internal typealias bridge = ${BRIDGE_NAMESPACE}

${swiftBridges}
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
  files.push({
    content: swiftCode,
    language: 'swift',
    name: `${bridgeName}.swift`,
    platform: 'ios',
    subdirectory: [],
  })
  return files
}

function createSwiftBridge(type: SwiftCxxBridgedType): string | undefined {
  if (!type.needsSpecialHandling) {
    // type does not need a bridge, it's a primitive
    return undefined
  }

  try {
    const cxxType = type.getTypeCode('swift')
    const swiftType = type.type.getCode('swift')

    return `
internal extension ${cxxType} {
  static func fromSwift(_ value: ${swiftType}) -> ${cxxType} {
    return ${indent(type.parseFromSwiftToCpp('value', 'swift'), '    ')}
  }

  func toSwift() -> ${swiftType} {
    return ${indent(type.parseFromCppToSwift('self', 'swift'), '    ')}
  }
}
  `
  } catch {
    // The type is not available in Swift!
    return undefined
  }
}
