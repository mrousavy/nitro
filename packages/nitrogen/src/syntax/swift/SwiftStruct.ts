import { indent } from '../../utils.js'
import { createFileMetadataString } from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import type { StructType } from '../types/StructType.js'

export function createSwiftStruct(struct: StructType): SourceFile {
  const properties = struct.properties.map(
    (t) => `public var ${t.escapedName}: ${t.getCode('swift')}`
  )

  const code = `
${createFileMetadataString(`${struct.structName}.swift`)}

/**
 * A struct which can be represented as a JavaScript object (${struct.structName}).
 */
public struct ${struct.structName} {
  ${indent(properties.join('\n'), '  ')}
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
