import { NitroConfig } from '../../config/NitroConfig.js'
import { indent, toLowerCamelCase } from '../../utils.js'
import type { SourceFile } from '../SourceFile.js'
import { createFileMetadataString } from '../helpers.js'
import type { EnumMember } from '../types/EnumType.js'
import { includeNitroHeader } from './includeNitroHeader.js'

/**
 * Creates a C++ enum that converts to a JS enum (aka just int)
 */
export function createCppEnum(
  typename: string,
  enumMembers: EnumMember[]
): SourceFile {
  // Map enum to C++ code
  const cppEnumMembers = enumMembers
    .map(
      (m) =>
        `${m.name}      SWIFT_NAME(${toLowerCamelCase(m.name)}) = ${m.value},`
    )
    .join('\n')
  const minValue = 0
  const maxValue = enumMembers.length - 1
  const cxxNamespace = NitroConfig.getCxxNamespace('c++')

  // Create entire C++ file
  const cppCode = `
${createFileMetadataString(`${typename}.hpp`)}

#pragma once

#include <cmath>
${includeNitroHeader('JSIConverter.hpp')}
${includeNitroHeader('NitroDefines.hpp')}

namespace ${cxxNamespace} {

  /**
   * An enum which can be represented as a JavaScript enum (${typename}).
   */
  enum class ${typename} {
    ${indent(cppEnumMembers, '    ')}
  } CLOSED_ENUM;

} // namespace ${cxxNamespace}

namespace margelo::nitro {

  using namespace ${cxxNamespace};

  // C++ ${typename} <> JS ${typename} (enum)
  template <>
  struct JSIConverter<${typename}> final {
    static inline ${typename} fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
      int enumValue = JSIConverter<int>::fromJSI(runtime, arg);
      return static_cast<${typename}>(enumValue);
    }
    static inline jsi::Value toJSI(jsi::Runtime& runtime, ${typename} arg) {
      int enumValue = static_cast<int>(arg);
      return JSIConverter<int>::toJSI(runtime, enumValue);
    }
    static inline bool canConvert(jsi::Runtime&, const jsi::Value& value) {
      if (!value.isNumber()) {
        return false;
      }
      double integer;
      double fraction = modf(value.getNumber(), &integer);
      if (fraction != 0.0) {
        // It is some kind of floating point number - our enums are ints.
        return false;
      }
      // Check if we are within the bounds of the enum.
      return integer >= ${minValue} && integer <= ${maxValue};
    }
  };

} // namespace margelo::nitro
        `

  return {
    content: cppCode,
    subdirectory: [],
    name: `${typename}.hpp`,
    language: 'c++',
    platform: 'shared',
  }
}
