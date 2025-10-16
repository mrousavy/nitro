import { NitroConfig } from '../../config/NitroConfig.js'
import { indent, toSafeCamelCase } from '../../utils.js'
import type { SourceFile } from '../SourceFile.js'
import { createFileMetadataString } from '../helpers.js'
import type { EnumMember } from '../types/EnumType.js'
import { includeNitroHeader } from './includeNitroHeader.js'

function getEnumMinValue(enumMembers: EnumMember[]): number {
  return Math.min(...enumMembers.map((m) => m.value))
}
function getEnumMaxValue(enumMembers: EnumMember[]): number {
  return Math.max(...enumMembers.map((m) => m.value))
}

function isIncrementingEnum(enumMembers: EnumMember[]): boolean {
  let lastValue = getEnumMinValue(enumMembers) - 1
  for (const enumMember of enumMembers) {
    if (enumMember.value !== lastValue + 1) {
      // it is not just one higher than the last value!
      return false
    }
    lastValue = enumMember.value
  }
  // all enum values were incrementing!
  return true
}

/**
 * Creates a C++ enum that converts to a JS enum (aka just int)
 */
export function createCppEnum(
  typename: string,
  enumMembers: EnumMember[]
): SourceFile {
  // Namespace typename
  const fullyQualifiedTypename = NitroConfig.current.getCxxNamespace(
    'c++',
    typename
  )
  // Map enum to C++ code
  const cppEnumMembers = enumMembers
    .map((m) => {
      return `${m.name}      SWIFT_NAME(${toSafeCamelCase(m.name)}) = ${m.value},`
    })
    .join('\n')
  const cxxNamespace = NitroConfig.current.getCxxNamespace('c++')

  let isInsideValidValues: string | undefined
  if (isIncrementingEnum(enumMembers)) {
    // It's just incrementing one after another, so we can simplify this to a bounds check
    const minValue = getEnumMinValue(enumMembers)
    const maxValue = getEnumMaxValue(enumMembers)
    isInsideValidValues = `
// Check if we are within the bounds of the enum.
return integer >= ${minValue} && integer <= ${maxValue};
    `.trim()
  } else {
    const cases = enumMembers.map(
      (m) => `case ${m.value} /* ${m.name} */: return true;`
    )
    isInsideValidValues = `
switch (integer) {
  ${indent(cases.join('\n'), '  ')}
  default: return false;
}
    `.trim()
  }

  // Create entire C++ file
  const cppCode = `
${createFileMetadataString(`${typename}.hpp`)}

#pragma once

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

  // C++ ${typename} <> JS ${typename} (enum)
  template <>
  struct JSIConverter<${fullyQualifiedTypename}> final {
    static inline ${fullyQualifiedTypename} fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
      int enumValue = JSIConverter<int>::fromJSI(runtime, arg);
      return static_cast<${fullyQualifiedTypename}>(enumValue);
    }
    static inline jsi::Value toJSI(jsi::Runtime& runtime, ${fullyQualifiedTypename} arg) {
      int enumValue = static_cast<int>(arg);
      return JSIConverter<int>::toJSI(runtime, enumValue);
    }
    static inline bool canConvert(jsi::Runtime&, const jsi::Value& value) {
      if (!value.isNumber()) {
        return false;
      }
      double number = value.getNumber();
      int integer = static_cast<int>(number);
      if (number != integer) {
        // The integer is not the same value as the double - we truncated floating points.
        // Enums are all integers, so the input floating point number is obviously invalid.
        return false;
      }
      ${indent(isInsideValidValues, '      ')}
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
