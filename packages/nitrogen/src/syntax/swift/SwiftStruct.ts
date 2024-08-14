import { NitroConfig } from '../../config/NitroConfig.js'
import { indent } from '../../utils.js'
import { createFileMetadataString } from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import type { StructType } from '../types/StructType.js'
import { SwiftCxxBridgedType } from './SwiftCxxBridgedType.js'

export function createSwiftStructBridge(struct: StructType): SourceFile {
  const fullName = NitroConfig.getCxxNamespace('swift', struct.structName)
  const bridgedProps = struct.properties
    .map((p) => {
      const bridge = new SwiftCxxBridgedType(p)
      const cppName = `self.__${p.escapedName}`
      return `
public var ${p.escapedName}: ${p.getCode('swift')} {
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

public extension ${fullName} {
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
