import { indent } from '../../utils.js'
import { createFileMetadataString, isNotDuplicate } from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import type { VariantType } from '../types/VariantType.js'
import { SwiftCxxBridgedType } from './SwiftCxxBridgedType.js'

export function createSwiftVariant(variant: VariantType): SourceFile {
  const typename = variant.getAliasName('swift')
  const cases = variant.cases
    .map(([label, type]) => {
      const bridge = new SwiftCxxBridgedType(type)
      return `case ${label}(${bridge.getTypeCode('swift')})`
    })
    .join('\n')
  const jsSignature = variant.variants.map((t) => t.kind).join(' | ')

  const extraImports = variant.variants
    .flatMap((t) => t.getRequiredImports('swift'))
    .map((i) => `import ${i.name}`)
    .filter(isNotDuplicate)

  const code = `
${createFileMetadataString(`${typename}.swift`)}

${extraImports.join('\n')}

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
