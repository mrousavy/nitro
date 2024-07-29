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

import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip

/**
 * Represents the JavaScript object/struct "${structType.structName}".
 */
@DoNotStrip
@Keep
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
