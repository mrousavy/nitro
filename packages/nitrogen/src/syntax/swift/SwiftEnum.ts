import { NitroConfig } from '../../config/NitroConfig.js'
import { createFileMetadataString } from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import type { EnumType } from '../types/EnumType.js'

export function createSwiftEnumBridge(enumType: EnumType): SourceFile {
  const fullName = NitroConfig.getCxxNamespace('swift', enumType.enumName)

  const code = `
${createFileMetadataString(`${enumType.enumName}.swift`)}

/**
 * Represents the JS ${enumType.jsType} \`${enumType.enumName}\`, backed by a C++ enum.
 */
public typealias ${enumType.enumName} = ${fullName}
  `.trim()

  return {
    content: code,
    language: 'swift',
    name: `${enumType.enumName}.swift`,
    platform: 'ios',
    subdirectory: [],
  }
}
