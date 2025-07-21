import { NitroConfig } from '../../config/NitroConfig.js'
import { indent } from '../../utils.js'
import { createFileMetadataString } from '../helpers.js'
import { Parameter } from '../Parameter.js'
import type { FileWithReferencedTypes } from '../SourceFile.js'
import { StructType } from '../types/StructType.js'
import { SwiftCxxBridgedType } from './SwiftCxxBridgedType.js'
import { getBridgeNamespace } from './SwiftHybridObjectBridge.js'

export function createSwiftStructBridge(
  struct: StructType
): FileWithReferencedTypes {
  const fullName = NitroConfig.current.getCxxNamespace('swift', struct.structName)
  const init = createSwiftBridgedConstructor(struct)
  const bridgedProps = struct.properties
    .map((p) => {
      const bridge = new SwiftCxxBridgedType(p, true)
      const cppName = `self.__${p.escapedName}`
      return `
var ${p.escapedName}: ${p.getCode('swift')} {
  @inline(__always)
  get {
    return ${indent(bridge.parseFromCppToSwift(cppName, 'swift'), '    ')}
  }
  @inline(__always)
  set {
    ${cppName} = ${indent(bridge.parseFromSwiftToCpp('newValue', 'swift'), '    ')}
  }
}
    `.trim()
    })
    .join('\n\n')

  const code = `
${createFileMetadataString(`${struct.structName}.swift`)}

import NitroModules

/**
 * Represents an instance of \`${struct.structName}\`, backed by a C++ struct.
 */
public typealias ${struct.structName} = ${fullName}

public extension ${struct.structName} {
  private typealias bridge = ${getBridgeNamespace()}

  ${indent(init, '  ')}

  ${indent(bridgedProps, '  ')}
}
  `.trim()

  return {
    content: code,
    language: 'swift',
    name: `${struct.structName}.swift`,
    platform: 'ios',
    subdirectory: [],
    referencedTypes: struct.properties,
  }
}

function createSwiftBridgedConstructor(struct: StructType): string {
  const params = struct.properties
    .map((p) => new Parameter(p.escapedName, p))
    .map((p) => p.getCode('swift'))
    .join(', ')
  const paramsForward = struct.properties
    .map((p) => {
      const bridged = new SwiftCxxBridgedType(p, true)
      return bridged.parseFromSwiftToCpp(p.escapedName, 'swift')
    })
    .join(', ')
  return `
/**
 * Create a new instance of \`${struct.structName}\`.
 */
init(${params}) {
  self.init(${indent(paramsForward, '  ')})
}
  `.trim()
}
