import { indent } from '../../stringUtils.js'
import { createFileMetadataString } from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import type { StructType } from '../types/StructType.js'

export function createKotlinStruct(
  packageName: string,
  structType: StructType
): SourceFile[] {
  const values = structType.properties.map(
    (p) => `${p.escapedName}: ${p.getCode('kotlin')}`
  )
  const code = `
${createFileMetadataString(`${structType.structName}.kt`)}

package ${packageName}

/**
 * Represents the JavaScript object/struct "${structType.structName}".
 */
data class ${structType.structName}(
  ${indent(values.join(',\n'), '  ')}
)
  `.trim()

  const files: SourceFile[] = []
  files.push({
    content: code,
    language: 'kotlin',
    name: `${structType.structName}.kt`,
    platform: 'android',
  })
  return files
}
