import type { Type } from 'ts-morph'
import type { File } from '../File.js'
import { createFileMetadataString, escapeCppName } from './../helpers.js'
import { indent } from '../../stringUtils.js'

export function createCppUnion(typename: string, unionTypes: Type[]): File {
  const enumValues = unionTypes.map((t) => {
    if (t.isStringLiteral()) {
      const literalValue = t.getLiteralValueOrThrow()
      if (typeof literalValue !== 'string')
        throw new Error(
          `${typename}: Value "${literalValue}" is not a string - it is ${typeof literalValue}!`
        )
      return {
        name: literalValue,
        escapedName: escapeCppName(literalValue),
      }
    } else {
      throw new Error(
        `${typename}: Value "${t.getText()}" is not a string literal - it cannot be represented in a C++ enum!`
      )
    }
  })
  const cppEnumMembers = enumValues.map((m) => `${m.escapedName},`).join('\n')
  const cppFromJsiHashCases = enumValues
    .map((v) =>
      `case hashString("${v.name}"): return ${typename}::${v.escapedName};`.trim()
    )
    .join('\n')
  const cppToJsiCases = enumValues
    .map(
      (v) =>
        `case ${typename}::${v.escapedName}: return JSIConverter<std::string>::toJSI(runtime, "${v.name}");`
    )
    .join('\n')

  const cppCode = `
${createFileMetadataString(`${typename}.hpp`)}

#pragma once

#include <NitroModules/Hash.hpp>
#include <NitroModules/JSIConverter.hpp>

enum class ${typename} {
  ${indent(cppEnumMembers, '  ')}
};

namespace margelo::nitro {

  // C++ ${typename} <> JS ${typename} (union)
  template <>
  struct JSIConverter<${typename}> {
    static inline ${typename} fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
      std::string unionValue = JSIConverter<std::string>::fromJSI(runtime, arg);
      switch (hashString(unionValue.c_str(), unionValue.size())) {
        ${indent(cppFromJsiHashCases, '        ')}
        default: [[unlikely]]
          throw std::runtime_error("Cannot convert " + unionValue + " to ${typename} - invalid value!");
      }
    }
    static inline jsi::Value toJSI(jsi::Runtime& runtime, ${typename} arg) {
      switch (arg) {
        ${indent(cppToJsiCases, '        ')}
        default: [[unlikely]]
          throw std::runtime_error("Cannot convert ${typename} to JS - invalid value: "
                                    + std::to_string(static_cast<int>(arg)) + "!");
      }
    }
  };

} // namespace margelo::nitro
          `
  return {
    content: cppCode,
    name: `${typename}.hpp`,
    language: 'c++',
  }
}
