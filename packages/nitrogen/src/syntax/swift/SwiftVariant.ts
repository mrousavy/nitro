import { capitalizeName, indent } from '../../utils.js'
import { createFileMetadataString, escapeCppName } from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import type { Type } from '../types/Type.js'
import type { VariantType } from '../types/VariantType.js'

export function getSwiftVariantTypename(variant: VariantType): string {
  const types = variant.variants.map((t) =>
    escapeCppName(capitalizeName(t.getCode('swift')))
  )
  return `Variant_${types.join('_')}`
}

export function getSwiftVariantCaseName(type: Type): string {
  const code = type.getCode('swift')
  return `some${capitalizeName(escapeCppName(code))}`
}

export function createSwiftVariant(variant: VariantType): SourceFile {
  const typename = getSwiftVariantTypename(variant)
  const cases = variant.variants
    .map((t) => {
      const type = t.getCode('swift')
      return `case ${getSwiftVariantCaseName(t)}(${type})`
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
public indirect enum ${typename} {
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
