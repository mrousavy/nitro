import type { FileWithReferencedTypes } from '../SourceFile.js'
import { indent } from '../../stringUtils.js'
import { createFileMetadataString, isNotDuplicate } from '../helpers.js'
import type { NamedType } from '../types/Type.js'
import { includeNitroHeader } from './includeNitroHeader.js'
import { NitroConfig } from '../../config/NitroConfig.js'

export function createCppStruct(
  typename: string,
  properties: NamedType[]
): FileWithReferencedTypes {
  // Get C++ code for all struct members
  const cppStructProps = properties
    .map((p) => `${p.getCode('c++')} ${p.escapedName};`)
    .join('\n')
  const cppConstructorParams = properties
    .map((p) => `${p.getCode('c++')} ${p.escapedName}`)
    .join(', ')
  const cppInitializerParams = properties
    .map((p) => `${p.escapedName}(${p.escapedName})`)
    .join(', ')
  // Get C++ code for converting each member from a jsi::Value
  const cppFromJsiParams = properties
    .map(
      (p) =>
        `JSIConverter<${p.getCode('c++')}>::fromJSI(runtime, obj.getProperty(runtime, "${p.name}"))`
    )
    .join(',\n')
  // Get C++ code for converting each member to a jsi::Value
  const cppToJsiCalls = properties
    .map(
      (p) =>
        `obj.setProperty(runtime, "${p.name}", JSIConverter<${p.getCode('c++')}>::toJSI(runtime, arg.${p.escapedName}));`
    )
    .join('\n')

  // Get C++ includes for each extra-file we need to include
  const includedTypes = properties.flatMap((r) => r.getRequiredImports())
  const cppForwardDeclarations = includedTypes
    .map((i) => i.forwardDeclaration)
    .filter((v) => v != null)
    .filter(isNotDuplicate)
  const cppExtraIncludes = includedTypes
    .map((f) => `#include "${f.name}"`)
    .filter(isNotDuplicate)
  const cxxNamespace = NitroConfig.getCxxNamespace('c++')

  const cppCode = `
${createFileMetadataString(`${typename}.hpp`)}

#pragma once

${includeNitroHeader('JSIConverter.hpp')}

${cppForwardDeclarations.join('\n')}

${cppExtraIncludes.join('\n')}

namespace ${cxxNamespace} {

  /**
   * A struct which can be represented as a JavaScript object (${typename}).
   */
  struct ${typename} {
  public:
    ${indent(cppStructProps, '    ')}

  public:
    explicit ${typename}(${cppConstructorParams}): ${cppInitializerParams} {}
  };

} // namespace ${cxxNamespace}

namespace margelo::nitro {

  using namespace ${cxxNamespace};

  // C++ ${typename} <> JS ${typename} (object)
  template <>
  struct JSIConverter<${typename}> {
    static inline ${typename} fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
      jsi::Object obj = arg.asObject(runtime);
      return ${typename}(
        ${indent(cppFromJsiParams, '        ')}
      );
    }
    static inline jsi::Value toJSI(jsi::Runtime& runtime, const ${typename}& arg) {
      jsi::Object obj(runtime);
      ${indent(cppToJsiCalls, '      ')}
      return obj;
    }
    static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
      throw std::runtime_error("Don't know if jsi::Value can be dynamically converted to struct \\"${typename}\\" yet!");
    }
  };

} // namespace margelo::nitro
  `
  return {
    content: cppCode,
    name: `${typename}.hpp`,
    subdirectory: [],
    language: 'c++',
    referencedTypes: properties,
    platform: 'shared',
  }
}
