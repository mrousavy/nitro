import { getUmbrellaHeaderName } from '../../autolinking/ios/createSwiftUmbrellaHeader.js'
import { NitroConfig } from '../../config/NitroConfig.js'
import { indent, toLowerCamelCase } from '../../utils.js'
import { createFileMetadataString } from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import type { EnumType } from '../types/EnumType.js'

export function createSwiftEnumBridge(enumType: EnumType): SourceFile[] {
  const iosNamespace = NitroConfig.current.getIosModuleName()
  const initializeCases = enumType.enumMembers.map((m) =>
    `
case "${m.stringValue}":
  self = .${toLowerCamelCase(m.name)}
    `.trim()
  )
  const toStringCases = enumType.enumMembers.map((m) =>
    `
case .${toLowerCamelCase(m.name)}:
  return "${m.stringValue}"
`.trim()
  )

  const cases = enumType.enumMembers.map(
    (m) => `case ${toLowerCamelCase(m.name)} = ${m.value}`
  )

  const cppTypeName = enumType.getCode('c++', { fullyQualified: true })
  const swiftToCppCases = enumType.enumMembers.map((m) =>
    `
case ${iosNamespace}::${enumType.enumName}::${toLowerCamelCase(m.name)}:
  return ${cppTypeName}::${m.name};
    `.trim()
  )
  const cppToSwiftCases = enumType.enumMembers.map((m) =>
    `
case ${cppTypeName}::${m.name}:
  return ${iosNamespace}::${enumType.enumName}::${toLowerCamelCase(m.name)}();
    `.trim()
  )

  const swiftCode = `
${createFileMetadataString(`${enumType.enumName}.swift`)}

/**
 * Represents the JS ${enumType.jsType} \`${enumType.enumName}\`.
 */
public enum ${enumType.enumName}: Int {
  ${indent(cases.join('\n'), '  ')}
}

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
  const cppHeaderCode = `
${createFileMetadataString(`${enumType.enumName}+Swift.hpp`)}

#pragma once

#include "${enumType.enumName}.hpp"

namespace ${iosNamespace} {
  class ${enumType.enumName};
}
namespace margelo::nitro {
  template <typename T, typename Enable>
  struct SwiftConverter;
}

namespace margelo::nitro {
  template <>
  struct SwiftConverter<${cppTypeName}, void> {
    using SwiftType = ${iosNamespace}::${enumType.enumName};
    static ${cppTypeName} fromSwift(const ${iosNamespace}::${enumType.enumName}& swiftEnum);
    static ${iosNamespace}::${enumType.enumName} toSwift(${cppTypeName} cppEnum);
  };
}
  `.trim()
  const cppSourceCode = `
${createFileMetadataString(`${enumType.enumName}+Swift.cpp`)}

#include "${getUmbrellaHeaderName()}"
#define SWIFT_IS_IMPORTED
#include <NitroModules/SwiftConverter.hpp>

#include "${enumType.enumName}+Swift.hpp"
#include "${enumType.enumName}.hpp"

namespace margelo::nitro {

  ${cppTypeName} SwiftConverter<${cppTypeName}>::fromSwift(const ${iosNamespace}::${enumType.enumName}& swiftEnum) {
    switch (swiftEnum) {
      ${indent(swiftToCppCases.join('\n'), '      ')}
    }
  }

  ${iosNamespace}::${enumType.enumName} SwiftConverter<${cppTypeName}>::toSwift(${cppTypeName} cppEnum) {
    switch (cppEnum) {
      ${indent(cppToSwiftCases.join('\n'), '      ')}
    }
  }

}
  `.trim()

  return [
    {
      content: swiftCode,
      language: 'swift',
      name: `${enumType.enumName}.swift`,
      platform: 'ios',
      subdirectory: [],
    },
    {
      content: cppHeaderCode,
      language: 'c++',
      name: `${enumType.enumName}+Swift.hpp`,
      platform: 'ios',
      subdirectory: [],
    },
    {
      content: cppSourceCode,
      language: 'c++',
      name: `${enumType.enumName}+Swift.cpp`,
      platform: 'ios',
      subdirectory: [],
    },
  ]
}
