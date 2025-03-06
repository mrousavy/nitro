import { indent } from '../../utils.js'
import { createFileMetadataString } from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import type { VariantType } from '../types/VariantType.js'

export function createSwiftVariant(variant: VariantType): SourceFile {
  const typename = variant.getAliasName('swift')
  const cases = variant.cases
    .map(([label, v]) => {
      const type = v.getCode('swift')
      return `case ${label}(${type})`
    })
    .join('\n')
  const jsSignature = variant.variants.map((t) => t.kind).join(' | ')

  const code = `
${createFileMetadataString(`${typename}.swift`)}

/**
 * An Swift enum with associated values representing a Variant/Union type.
 * JS type: \`${jsSignature}\`
 */
@frozen
public enum ${typename} {
  ${indent(cases, '  ')}
}
  `.trim()

  return {
    content: code,
    language: 'swift',
    name: `${typename}.swift`,
    platform: 'ios',
    subdirectory: [],
  }
}
