import { getUmbrellaHeaderName } from '../../autolinking/ios/createSwiftUmbrellaHeader.js'
import { NitroConfig } from '../../config/NitroConfig.js'
import { capitalizeName, indent } from '../../utils.js'
import { createFileMetadataString, isNotDuplicate } from '../helpers.js'
import type { FileWithReferencedTypes } from '../SourceFile.js'
import { StructType } from '../types/StructType.js'

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
  const swiftInitParameters = struct.properties.map(
    (p) => `${p.escapedName}: ${p.getCode('swift')}`
  )
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

#include <functional>
#include "${struct.structName}.hpp"
#include <NitroModules/SwiftConverter.hpp>

namespace ${iosNamespace} {
  class ${struct.structName};
}

namespace margelo::nitro {
  template <>
  struct SwiftConverter<${cppStructName}> {
    using SwiftType = ${iosNamespace}::${struct.structName};
    static ${cppStructName} fromSwift(const ${iosNamespace}::${struct.structName}& swiftStruct);
    static ${iosNamespace}::${struct.structName} toSwift(const ${cppStructName}& cppStruct);
  };
}
    `.trim()
  const cppSourceCode = `
  ${createFileMetadataString(`${struct.structName}+Swift.cpp`)}

#include "${struct.structName}+Swift.hpp"
#include "${struct.structName}.hpp"
#include <functional>
#include "${getUmbrellaHeaderName()}"
#include <NitroModules/SwiftConverter.hpp>

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
