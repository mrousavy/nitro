import { NitroConfig } from '../../config/NitroConfig.js'
import { indent } from '../../utils.js'
import { createFileMetadataString } from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import type { StructType } from '../types/StructType.js'
import { SwiftCxxBridgedType } from './SwiftCxxBridgedType.js'

export function createSwiftStructBridge(struct: StructType): SourceFile {
  const fullName = NitroConfig.getCxxNamespace('swift', struct.structName)
  const init = createSwiftBridgedConstructor(struct)
  const bridgedProps = struct.properties
    .map((p) => {
      const bridge = new SwiftCxxBridgedType(p)
      const cppName = `self.__${p.escapedName}`
      return `
var ${p.escapedName}: ${p.getCode('swift')} {
  @inline(__always)
  get {
    return ${bridge.parseFromCppToSwift(cppName, 'swift')}
  }
  @inline(__always)
  set {
    ${cppName} = ${bridge.parseFromSwiftToCpp('newValue', 'swift')}
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
  }
}

function createSwiftBridgedConstructor(struct: StructType): string {
  const params = struct.properties
    .map((p) => `${p.escapedName}: ${p.getCode('swift')}`)
    .join(', ')
  const paramsForward = struct.properties
    .map((p) => {
      const bridged = new SwiftCxxBridgedType(p)
      return bridged.parseFromSwiftToCpp(p.escapedName, 'swift')
    })
    .join(', ')
  return `
/**
 * Create a new instance of \`${struct.structName}\`.
 */
init(${params}) {
  self.init(${paramsForward})
}
  `.trim()
}
