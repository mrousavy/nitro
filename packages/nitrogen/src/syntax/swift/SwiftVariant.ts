import { getUmbrellaHeaderName } from '../../autolinking/ios/createSwiftUmbrellaHeader.js'
import { NitroConfig } from '../../config/NitroConfig.js'
import { indent } from '../../utils.js'
import { includeHeader } from '../c++/includeNitroHeader.js'
import { createFileMetadataString, isNotDuplicate } from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import type { VariantType } from '../types/VariantType.js'
import { SwiftCxxBridgedType } from './SwiftCxxBridgedType.js'

export function createSwiftVariantBridge(variant: VariantType): SourceFile[] {
  const iosNamespace = NitroConfig.current.getIosModuleName()
  const typename = variant.getAliasName('swift')
  const cppTypeName = variant.getCode('c++', { fullyQualified: true })
  const cases = variant.cases
    .map(([label, type]) => {
      const bridge = new SwiftCxxBridgedType(type)
      return `case ${label}(${bridge.getTypeCode('swift')})`
    })
    .join('\n')
  const jsSignature = variant.variants.map((t) => t.kind).join(' | ')

  const extraImports = variant.variants
    .flatMap((t) => t.getRequiredImports('swift'))
    .map((i) => `import ${i.name}`)
    .filter(isNotDuplicate)
  const extraIncludes = variant.variants
    .flatMap((t) => t.getRequiredImports('c++'))
    .map((i) => includeHeader(i, true))
    .filter(isNotDuplicate)

  const swiftCode = `
${createFileMetadataString(`${typename}.swift`)}

${extraImports.join('\n')}

/**
 * An Swift enum with associated values representing a Variant/Union type.
 * JS type: \`${jsSignature}\`
 */
@frozen
public enum ${typename} {
  ${indent(cases, '  ')}
}
  `.trim()

  const cppHeaderCode = `
${createFileMetadataString(`${typename}+Swift.hpp`)}

#pragma once

#include <variant>
${extraIncludes.join('\n')}

namespace ${iosNamespace} {
  class ${typename};
}
namespace margelo::nitro {
  template <typename T, typename Enable>
  struct SwiftConverter;
}

namespace margelo::nitro {
  template <>
  struct SwiftConverter<${cppTypeName}, void> {
    using SwiftType = ${iosNamespace}::${typename};
    static ${cppTypeName} fromSwift(const ${iosNamespace}::${typename}& swiftEnum);
    static ${iosNamespace}::${typename} toSwift(${cppTypeName} cppEnum);
  };
}
  `.trim()
  const cppSourceCode = `
${createFileMetadataString(`${typename}+Swift.cpp`)}

#include "${getUmbrellaHeaderName()}"
#define SWIFT_IS_IMPORTED
#include <NitroModules/SwiftConverter.hpp>

#include "${typename}+Swift.hpp"

namespace margelo::nitro {

  ${cppTypeName} SwiftConverter<${cppTypeName}>::fromSwift(const ${iosNamespace}::${typename}& swiftEnum) {
    throw std::runtime_error("not yet implemented!");
  }

  ${iosNamespace}::${typename} SwiftConverter<${cppTypeName}>::toSwift(${cppTypeName} cppEnum) {
    throw std::runtime_error("not yet implemented!");
  }

}
  `.trim()

  return [
    {
      content: swiftCode,
      language: 'swift',
      name: `${typename}.swift`,
      platform: 'ios',
      subdirectory: [],
    },
    {
      content: cppHeaderCode,
      language: 'c++',
      name: `${typename}+Swift.hpp`,
      platform: 'ios',
      subdirectory: [],
    },
    {
      content: cppSourceCode,
      language: 'c++',
      name: `${typename}+Swift.cpp`,
      platform: 'ios',
      subdirectory: [],
    },
  ]
}
