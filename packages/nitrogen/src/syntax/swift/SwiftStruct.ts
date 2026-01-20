import { getUmbrellaHeaderName } from '../../autolinking/ios/createSwiftUmbrellaHeader.js'
import { NitroConfig } from '../../config/NitroConfig.js'
import { capitalizeName, indent } from '../../utils.js'
import { createFileMetadataString, isNotDuplicate } from '../helpers.js'
import { Parameter } from '../Parameter.js'
import type { FileWithReferencedTypes } from '../SourceFile.js'
import { EnumType } from '../types/EnumType.js'
import { FunctionType } from '../types/FunctionType.js'
import { getTypeAs } from '../types/getTypeAs.js'
import { StructType } from '../types/StructType.js'
import type { Type } from '../types/Type.js'
import { getSwiftFunctionClassName } from './SwiftFunction.js'

function getRequiredBridgeImport(type: Type): string | undefined {
  // TODO: Avoid duplicating the name of those files - create one single source of truth so we dont fuck up renames
  switch (type.kind) {
    case 'struct': {
      const struct = getTypeAs(type, StructType)
      return `${struct.structName}+Swift.hpp`
    }
    case 'enum': {
      const enumType = getTypeAs(type, EnumType)
      return `${enumType.enumName}+Swift.hpp`
    }
    case 'function': {
      const functionType = getTypeAs(type, FunctionType)
      const swiftClassName = getSwiftFunctionClassName(functionType)
      return `${swiftClassName}+Swift.hpp`
    }
    default:
      return undefined
  }
}

export function createSwiftStructBridge(
  struct: StructType
): FileWithReferencedTypes[] {
  const iosNamespace = NitroConfig.current.getIosModuleName()
  const cppStructName = NitroConfig.current.getCxxNamespace(
    'c++',
    struct.structName
  )
  const requiredImports = struct.properties
    .flatMap((p) => p.getRequiredImports('swift'))
    .map((i) => `import ${i.name}`)
  requiredImports.push('import NitroModules')
  const imports = requiredImports.filter(isNotDuplicate)
  const structMembers = struct.properties.map(
    (p) => `public let ${p.escapedName}: ${p.getCode('swift')}`
  )
  const swiftInitParameters = struct.properties.map((p) => {
    const param = new Parameter(p.escapedName, p)
    return param.getCode('swift')
  })
  const swiftInitAssignments = struct.properties.map(
    (p) => `self.${p.escapedName} = ${p.escapedName}`
  )
  const swiftToCppInitializers = struct.properties.map((p) => {
    const swiftGetter = `get${capitalizeName(p.escapedName)}`
    return `SwiftConverter<${p.getCode('c++', { fullyQualified: true })}>::fromSwift(swiftStruct.${swiftGetter}())`
  })
  const cppToSwiftInitializers = struct.properties.map(
    (p) =>
      `SwiftConverter<${p.getCode('c++', { fullyQualified: true })}>::toSwift(cppStruct.${p.escapedName})`
  )

  const extraImports = struct.properties
    .map((p) => getRequiredBridgeImport(p))
    .filter((i) => i != null)
    .map((i) => `#include "${i}"`)

  const swiftCode = `
${createFileMetadataString(`${struct.structName}.swift`)}

import Foundation
${imports.join('\n')}

/**
 * Represents an instance of \`${struct.structName}\`.
 */
public struct ${struct.structName} {
  ${indent(structMembers.join('\n'), '  ')}

  public init(
    ${indent(swiftInitParameters.join(',\n'), '    ')}
  ) {
    ${indent(swiftInitAssignments.join('\n'), '    ')}
  }
}
  `.trim()
  const cppHeaderCode = `
${createFileMetadataString(`${struct.structName}+Swift.hpp`)}

#pragma once

#include <functional>
#include "${struct.structName}.hpp"

namespace ${iosNamespace} {
  class ${struct.structName};
}
namespace margelo::nitro {
  template <typename T, typename Enable>
  struct SwiftConverter;
}

namespace margelo::nitro {
  template <>
  struct SwiftConverter<${cppStructName}, void> {
    using SwiftType = ${iosNamespace}::${struct.structName};
    static ${cppStructName} fromSwift(const ${iosNamespace}::${struct.structName}& swiftStruct);
    static ${iosNamespace}::${struct.structName} toSwift(const ${cppStructName}& cppStruct);
  };
}
    `.trim()
  const cppSourceCode = `
  ${createFileMetadataString(`${struct.structName}+Swift.cpp`)}

#include "${getUmbrellaHeaderName()}"
#define SWIFT_IS_IMPORTED
#include <NitroModules/SwiftConverter.hpp>

#include "${struct.structName}+Swift.hpp"
#include "${struct.structName}.hpp"
#include <functional>
${extraImports.join('\n')}

namespace margelo::nitro {

  ${cppStructName} SwiftConverter<${cppStructName}>::fromSwift(const ${iosNamespace}::${struct.structName}& swiftStruct) {
    return ${cppStructName}(
      ${indent(swiftToCppInitializers.join(',\n'), '      ')}
    );
  }

  ${iosNamespace}::${struct.structName} SwiftConverter<${cppStructName}>::toSwift(const ${cppStructName}& cppStruct) {
    return ${iosNamespace}::${struct.structName}::init(
      ${indent(cppToSwiftInitializers.join(',\n'), '      ')}
    );
  }

}
    `.trim()

  return [
    {
      content: swiftCode,
      language: 'swift',
      name: `${struct.structName}.swift`,
      platform: 'ios',
      subdirectory: [],
      referencedTypes: struct.properties,
    },
    {
      content: cppHeaderCode,
      language: 'c++',
      name: `${struct.structName}+Swift.hpp`,
      platform: 'ios',
      subdirectory: [],
      referencedTypes: [],
    },
    {
      content: cppSourceCode,
      language: 'c++',
      name: `${struct.structName}+Swift.cpp`,
      platform: 'ios',
      subdirectory: [],
      referencedTypes: struct.properties,
    },
  ]
}
