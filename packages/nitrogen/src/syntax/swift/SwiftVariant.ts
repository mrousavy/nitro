import { capitalizeName, indent } from '../../utils.js'
import { createFileMetadataString } from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import type { VariantType } from '../types/VariantType.js'

export function createSwiftVariant(
  name: string,
  variant: VariantType
): SourceFile {
  const types = variant.variants.map((t) => {
    const type = t.getCode('swift')
    return `some${capitalizeName(type)}(${type})`
  })

  const code = `
${createFileMetadataString(`${name}.swift`)}

import NitroModules

@frozen
public enum ${name} {
  ${indent(types.join('\n'), '  ')}
}
  `
  return {
    name: `${name}.swift`,
    content: code,
    language: 'swift',
    platform: 'ios',
    subdirectory: [],
  }
}
