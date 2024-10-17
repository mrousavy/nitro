import { NitroConfig } from '../../config/NitroConfig.js'
import {
  includeHeader,
  includeNitroHeader,
} from '../../syntax/c++/includeNitroHeader.js'
import { getAllKnownTypes } from '../../syntax/createType.js'
import {
  createFileMetadataString,
  isNotDuplicate,
} from '../../syntax/helpers.js'
import type { SourceFile } from '../../syntax/SourceFile.js'
import { getReferencedTypes } from '../../syntax/getReferencedTypes.js'
import { SwiftCxxBridgedType } from '../../syntax/swift/SwiftCxxBridgedType.js'
import { filterDuplicateHelperBridges, indent } from '../../utils.js'
import { getTypeAs } from '../../syntax/types/getTypeAs.js'
import { HybridObjectType } from '../../syntax/types/HybridObjectType.js'
import { getForwardDeclaration } from '../../syntax/c++/getForwardDeclaration.js'
import { getHybridObjectName } from '../../syntax/getHybridObjectName.js'
import { getUmbrellaHeaderName } from './createSwiftUmbrellaHeader.js'

const SWIFT_BRIDGE_NAMESPACE = ['bridge', 'swift']

export function createSwiftCxxBridge(): SourceFile[] {
  const moduleName = NitroConfig.getIosModuleName()
  const bridgeName = `${moduleName}-Swift-Cxx-Bridge`
  const umbrellaHeader = getUmbrellaHeaderName()

  const types = getAllKnownTypes().map((t) => new SwiftCxxBridgedType(t))

  const bridges = types
    .flatMap((t) => {
      const referenced = getReferencedTypes(t.type)
      return referenced.map((r) => {
        const bridge = new SwiftCxxBridgedType(r)
        return bridge.getRequiredBridge()
      })
    })
    .filter((b) => b != null)
    .filter(filterDuplicateHelperBridges)
  const headerHelperFunctions = bridges
    .map((b) => `// pragma MARK: ${b.cxxType}\n${b.cxxHeaderCode}`)
    .filter(isNotDuplicate)
    .join('\n\n')
  const implementationHelperFunctions = bridges
    .map((b) => `// pragma MARK: ${b.cxxType}\n${b.cxxImplementationCode}`)
    .filter(isNotDuplicate)
    .join('\n\n')

  const requiredImports = bridges.flatMap((b) => b.requiredIncludes)
  const includes = requiredImports
    .map((i) => includeHeader(i, i.space === 'system'))
    .filter(isNotDuplicate)
  const forwardDeclarations = requiredImports
    .map((i) => i.forwardDeclaration)
    .filter((f) => f != null)
    .filter(isNotDuplicate)
  const namespace = NitroConfig.getCxxNamespace(
    'c++',
    ...SWIFT_BRIDGE_NAMESPACE
  )

  const forwardDeclaredSwiftTypes = types
    .filter((t) => t.type.kind === 'hybrid-object')
    .map((t) => {
      const hybridObject = getTypeAs(t.type, HybridObjectType)
      const { HybridTSpecCxx } = getHybridObjectName(
        hybridObject.hybridObjectName
      )
      return getForwardDeclaration('class', HybridTSpecCxx, moduleName)
    })

  const header = `
${createFileMetadataString(`${bridgeName}.hpp`)}

#pragma once

${includeNitroHeader('NitroDefines.hpp')}

// Forward declarations of C++ defined types
${forwardDeclarations.sort().join('\n')}

// Forward declarations of Swift defined types
${forwardDeclaredSwiftTypes.sort().join('\n')}

// Include C++ defined types
${includes.sort().join('\n')}

/**
 * Contains specialized versions of C++ templated types so they can be accessed from Swift,
 * as well as helper functions to interact with those C++ types from Swift.
 */
namespace ${namespace} {

  ${indent(headerHelperFunctions, '  ')}

} // namespace ${namespace}
`

  const source = `
${createFileMetadataString(`${bridgeName}.cpp`)}

#include "${bridgeName}.hpp"
#include "${umbrellaHeader}"

namespace ${namespace} {

  ${indent(implementationHelperFunctions, '  ')}

} // namespace ${namespace}
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
