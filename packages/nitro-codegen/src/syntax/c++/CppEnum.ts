import { indent } from '../../stringUtils.js'
import type { SourceFile } from '../SourceFile.js'
import { createFileMetadataString } from '../helpers.js'
import type { EnumMember } from '../types/EnumType.js'

/**
 * Creates a C++ enum that converts to a JS enum (aka just int)
 */
export function createCppEnum(
  typename: string,
  enumMembers: EnumMember[]
): SourceFile {
  // Map enum to C++ code
  const cppEnumMembers = enumMembers
    .map((m) => `${m.name} SWIFT_NAME(${m.name.toLowerCase()}) = ${m.value},`)
    .join('\n')

  // Create entire C++ file
  const cppCode = `
${createFileMetadataString(`${typename}.hpp`)}

#pragma once

#include <NitroModules/JSIConverter.hpp>
#include <NitroModules/NitroDefines.hpp>

/**
 * An enum which can be represented as a JavaScript enum (${typename}).
 */
enum class ${typename} {
  ${indent(cppEnumMembers, '  ')}
} CLOSED_ENUM;

namespace margelo::nitro {

  // C++ ${typename} <> JS ${typename} (enum)
  template <>
  struct JSIConverter<${typename}> {
    static inline ${typename} fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
      int enumValue = JSIConverter<int>::fromJSI(runtime, arg);
      return static_cast<${typename}>(enumValue);
    }
    static inline jsi::Value toJSI(jsi::Runtime& runtime, ${typename} arg) {
      int enumValue = static_cast<int>(arg);
      return JSIConverter<int>::toJSI(enumValue);
    }
  };

} // namespace margelo::nitro
        `

  return {
    content: cppCode,
    name: `${typename}.hpp`,
    language: 'c++',
    platform: 'shared',
  }
}
