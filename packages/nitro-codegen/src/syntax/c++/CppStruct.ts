import type { Symbol } from 'ts-morph'
import type { SourceFile } from '../SourceFile.js'
import { indent } from '../../stringUtils.js'
import { createFileMetadataString } from '../helpers.js'
import type { NamedType } from '../types/Type.js'
import { createNamedType } from '../createType.js'

interface FileWithReferencedTypes extends SourceFile {
  referencedTypes: NamedType[]
}

export function createCppStruct(
  typename: string,
  properties: Symbol[]
): FileWithReferencedTypes {
  const cppProperties: NamedType[] = []
  for (const prop of properties) {
    // recursively resolve types for each property of the referenced type
    const declaration = prop.getValueDeclarationOrThrow()
    const propType = prop.getTypeAtLocation(declaration)
    const refType = createNamedType(prop.getName(), propType, prop.isOptional())
    cppProperties.push(refType)
  }
  // Get C++ code for all struct members
  const cppStructProps = cppProperties
    .map((p) => `${p.getCode('c++')} ${p.escapedName};`)
    .join('\n')
  const cppConstructorParams = cppProperties
    .map((p) => `${p.getCode('c++')} ${p.escapedName}`)
    .join(', ')
  const cppInitializerParams = cppProperties
    .map((p) => `${p.escapedName}(${p.escapedName})`)
    .join(', ')
  // Get C++ code for converting each member from a jsi::Value
  const cppFromJsiParams = cppProperties
    .map(
      (p) =>
        `JSIConverter<${p.getCode('c++')}>::fromJSI(runtime, obj.getProperty(runtime, "${p.name}"))`
    )
    .join(',\n')
  // Get C++ code for converting each member to a jsi::Value
  const cppToJsiCalls = cppProperties
    .map(
      (p) =>
        `obj.setProperty(runtime, "${p.name}", JSIConverter<${p.getCode('c++')}>::toJSI(runtime, arg.${p.escapedName}));`
    )
    .join('\n')

  // Get C++ includes for each extra-file we need to include
  const extraFiles = cppProperties.flatMap((r) => r.getExtraFiles())
  const cppExtraIncludes = extraFiles.map((f) => `#include "${f.name}"`)

  const cppCode = `
${createFileMetadataString(`${typename}.hpp`)}

#pragma once

#include <NitroModules/JSIConverter.hpp>

${cppExtraIncludes.join('\n')}

struct ${typename} {
public:
  ${indent(cppStructProps, '  ')}

public:
  explicit ${typename}(${cppConstructorParams}): ${cppInitializerParams} {}
};

namespace margelo::nitro {

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
  };

} // namespace margelo::nitro
  `
  return {
    content: cppCode,
    name: `${typename}.hpp`,
    language: 'c++',
    referencedTypes: cppProperties,
  }
}
