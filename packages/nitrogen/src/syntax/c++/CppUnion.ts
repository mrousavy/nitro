import type { SourceFile } from '../SourceFile.js'
import { createFileMetadataString } from './../helpers.js'
import { indent, toLowerCamelCase } from '../../utils.js'
import type { EnumMember } from '../types/EnumType.js'
import { includeNitroHeader } from './includeNitroHeader.js'
import { NitroConfig } from '../../config/NitroConfig.js'

/**
 * Creates a C++ enum that converts to a TypeScript union (aka just strings).
 */
export function createCppUnion(
  typename: string,
  enumMembers: EnumMember[]
): SourceFile {
  const cppEnumMembers = enumMembers
    .map(
      (m, i) => `${m.name}      SWIFT_NAME(${toLowerCamelCase(m.name)}) = ${i},`
    )
    .join('\n')
  const cppFromJsiHashCases = enumMembers
    .map((v) =>
      `case hashString("${v.stringValue}"): return ${typename}::${v.name};`.trim()
    )
    .join('\n')
  const cppToJsiCases = enumMembers
    .map(
      (v) =>
        `case ${typename}::${v.name}: return JSIConverter<std::string>::toJSI(runtime, "${v.stringValue}");`
    )
    .join('\n')
  const cppCanConvertCases = enumMembers
    .map((m) => `case hashString("${m.stringValue}"):`)
    .join('\n')
  const cxxNamespace = NitroConfig.current.getCxxNamespace('c++')

  const cppCode = `
${createFileMetadataString(`${typename}.hpp`)}

#pragma once

${includeNitroHeader('NitroHash.hpp')}
${includeNitroHeader('JSIConverter.hpp')}
${includeNitroHeader('NitroDefines.hpp')}

namespace ${cxxNamespace} {

  /**
   * An enum which can be represented as a JavaScript union (${typename}).
   */
  enum class ${typename} {
    ${indent(cppEnumMembers, '    ')}
  } CLOSED_ENUM;

} // namespace ${cxxNamespace}

namespace margelo::nitro {

  using namespace ${cxxNamespace};

  // C++ ${typename} <> JS ${typename} (union)
  template <>
  struct JSIConverter<${typename}> final {
    static inline ${typename} fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
      std::string unionValue = JSIConverter<std::string>::fromJSI(runtime, arg);
      switch (hashString(unionValue.c_str(), unionValue.size())) {
        ${indent(cppFromJsiHashCases, '        ')}
        default: [[unlikely]]
          throw std::invalid_argument("Cannot convert \\"" + unionValue + "\\" to enum ${typename} - invalid value!");
      }
    }
    static inline jsi::Value toJSI(jsi::Runtime& runtime, ${typename} arg) {
      switch (arg) {
        ${indent(cppToJsiCases, '        ')}
        default: [[unlikely]]
          throw std::invalid_argument("Cannot convert ${typename} to JS - invalid value: "
                                    + std::to_string(static_cast<int>(arg)) + "!");
      }
    }
    static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
      if (!value.isString()) {
        return false;
      }
      std::string unionValue = JSIConverter<std::string>::fromJSI(runtime, value);
      switch (hashString(unionValue.c_str(), unionValue.size())) {
        ${indent(cppCanConvertCases, '        ')}
          return true;
        default:
          return false;
      }
    }
  };

} // namespace margelo::nitro
          `
  return {
    content: cppCode,
    name: `${typename}.hpp`,
    subdirectory: [],
    language: 'c++',
    platform: 'shared',
  }
}
