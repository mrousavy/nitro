import { NitroConfig } from '../../config/NitroConfig.js'
import { indent, toSafeCamelCase } from '../../utils.js'
import { createFileMetadataString } from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import type { EnumType } from '../types/EnumType.js'

export function createSwiftEnumBridge(enumType: EnumType): SourceFile {
  const fullName = NitroConfig.current.getCxxNamespace(
    'swift',
    enumType.enumName
  )

  const initializeCases = enumType.enumMembers.map((m) =>
    `
case "${m.stringValue}":
  self = .${toSafeCamelCase(m.name)}
    `.trim()
  )
  const toStringCases = enumType.enumMembers.map((m) =>
    `
case .${toSafeCamelCase(m.name)}:
  return "${m.stringValue}"
`.trim()
  )

  const code = `
${createFileMetadataString(`${enumType.enumName}.swift`)}

/**
 * Represents the JS ${enumType.jsType} \`${enumType.enumName}\`, backed by a C++ enum.
 */
public typealias ${enumType.enumName} = ${fullName}

public extension ${enumType.enumName} {
  /**
   * Get a ${enumType.enumName} for the given String value, or
   * return \`nil\` if the given value was invalid/unknown.
   */
  init?(fromString string: String) {
    switch string {
      ${indent(initializeCases.join('\n'), '      ')}
      default:
        return nil
    }
  }

  /**
   * Get the String value this ${enumType.enumName} represents.
   */
  var stringValue: String {
    switch self {
      ${indent(toStringCases.join('\n'), '      ')}
    }
  }
}
  `.trim()

  return {
    content: code,
    language: 'swift',
    name: `${enumType.enumName}.swift`,
    platform: 'ios',
    subdirectory: [],
  }
}
