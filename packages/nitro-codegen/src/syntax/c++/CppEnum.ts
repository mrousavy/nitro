import type { EnumMember } from 'ts-morph'
import { indent } from '../../stringUtils.js'
import type { SourceFile } from '../SourceFile.js'
import { createFileMetadataString, escapeCppName } from '../helpers.js'

export function createCppEnum(
  typename: string,
  enumMembers: EnumMember[]
): SourceFile {
  // Map Enum to { name, value }
  const enumValues = enumMembers.map((m) => {
    const name = m.getSymbolOrThrow().getEscapedName()
    const value = m.getValue()
    if (typeof value !== 'number') {
      throw new Error(
        `Enum member ${typename}.${name} is ${value} (${typeof value}), which cannot be represented in C++ enums.\n` +
          `Each enum member must be a number! If you want to use strings, use TypeScript unions ("a" | "b") instead!`
      )
    }
    return { name: name, value: value }
  })

  // Map enum to C++ code
  const cppEnumMembers = enumValues
    .map((m) => `${escapeCppName(m.name)} = ${m.value},`)
    .join('\n')

  // Create entire C++ file
  const cppCode = `
${createFileMetadataString(`${typename}.hpp`)}

#pragma once

#include <NitroModules/JSIConverter.hpp>

enum class ${typename} {
  ${indent(cppEnumMembers, '  ')}
} __attribute__((enum_extensibility(closed)));

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
  }
}
