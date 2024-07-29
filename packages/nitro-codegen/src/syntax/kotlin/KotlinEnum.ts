import { indent } from '../../stringUtils.js'
import { createFileMetadataString } from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import { EnumType } from '../types/EnumType.js'

export function createKotlinEnum(
  packageName: string,
  enumType: EnumType
): SourceFile[] {
  const members = enumType.enumMembers.map((m) => m.name.toUpperCase())
  const code = `
${createFileMetadataString(`${enumType.enumName}.kt`)}

package ${packageName}

import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip

/**
 * Represents the JavaScript enum/union "${enumType.enumName}".
 */
@DoNotStrip
@Keep
enum class ${enumType.enumName} {
  ${indent(members.join(',\n'), '  ')}
}
  `.trim()

  const files: SourceFile[] = []
  files.push({
    content: code,
    language: 'kotlin',
    name: `${enumType.enumName}.kt`,
    platform: 'android',
  })
  return files
}
