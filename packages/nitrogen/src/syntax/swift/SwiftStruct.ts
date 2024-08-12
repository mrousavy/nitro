import { NitroConfig } from '../../config/NitroConfig.js'
import { indent } from '../../utils.js'
import { createFileMetadataString } from '../helpers.js'
import { Property } from '../Property.js'
import type { SourceFile } from '../SourceFile.js'
import type { StructType } from '../types/StructType.js'
import { SwiftCxxBridgedType } from './SwiftCxxBridgedType.js'

export function createSwiftStruct(struct: StructType): SourceFile {
  const fullName = NitroConfig.getCxxNamespace('swift', struct.structName)
  const properties = struct.properties
    .filter((t) => t.kind === 'optional')
    .map((t) => {
      const property = new Property(t.name, t, false)
      const bridged = new SwiftCxxBridgedType(t)
      return property.getCode(
        'swift',
        { inline: true },
        {
          getter: bridged.parseFromCppToSwift(t.name, 'swift'),
          setter: bridged.parseFromSwiftToCpp(t.name, 'swift'),
        }
      )
    })

  const code = `
${createFileMetadataString(`${struct.structName}.swift`)}

import NitroModules

public extension ${fullName} {
  ${indent(properties.join(', '), '  ')}
}
  `
  return {
    name: `${struct.structName}.swift`,
    content: code,
    language: 'swift',
    platform: 'ios',
    subdirectory: [],
  }
}
