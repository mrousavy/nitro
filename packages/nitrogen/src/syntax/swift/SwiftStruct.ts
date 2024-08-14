import { NitroConfig } from '../../config/NitroConfig.js'
import { indent } from '../../utils.js'
import { createFileMetadataString } from '../helpers.js'
import type { FileWithReferencedTypes } from '../SourceFile.js'
import { StructType } from '../types/StructType.js'
import { SwiftCxxBridgedType } from './SwiftCxxBridgedType.js'
import { BRIDGE_NAMESPACE } from './SwiftHybridObjectBridge.js'

export function createSwiftStructBridge(
  struct: StructType
): FileWithReferencedTypes {
  const fullName = NitroConfig.getCxxNamespace('swift', struct.structName)
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

public typealias ${struct.structName} = ${fullName}

/**
 * Represents an instance of \`${struct.structName}\`, backed by a C++ object.
 */
public extension ${struct.structName} {
  private typealias bridge = ${BRIDGE_NAMESPACE}

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
    .map((p) => `${p.escapedName}: ${p.getCode('swift')}`)
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
