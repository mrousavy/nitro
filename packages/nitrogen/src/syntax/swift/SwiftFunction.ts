import { getUmbrellaHeaderName } from '../../autolinking/ios/createSwiftUmbrellaHeader.js'
import { NitroConfig } from '../../config/NitroConfig.js'
import {
  createFileMetadataString,
  escapeCppName,
  isNotDuplicate,
} from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import type { FunctionType } from '../types/FunctionType.js'
import { SwiftCxxBridgedType } from './SwiftCxxBridgedType.js'

export function getSwiftFunctionClassName(functionType: FunctionType): string {
  const returnType = functionType.returnType.getCode('swift')
  if (functionType.parameters.length > 0) {
    const parameters = functionType.parameters.map((p) =>
      p.getCode('swift', { fullyQualified: false })
    )
    return escapeCppName(`Func_${parameters.join('_')}_${returnType}`)
  } else {
    return escapeCppName(`Func_${returnType}`)
  }
}

export function createSwiftFunctionBridge(
  functionType: FunctionType
): SourceFile[] {
  const iosNamespace = NitroConfig.current.getIosModuleName()
  const bridgeNamespace = NitroConfig.current.getSwiftBridgeNamespace('swift')

  const bridgedFunction = new SwiftCxxBridgedType(functionType)
  const bridge = bridgedFunction.getRequiredBridge()
  if (bridge == null) throw new Error(`FunctionType has to have a bridge!`)

  const returnType = functionType.returnType.getCode('swift')
  const argsTypes = functionType.parameters.map(
    (p) => `${p.escapedName}: ${p.getCode('swift')}`
  )
  const argsForward = functionType.parameters.map((p) => p.escapedName)
  const paramsCpp = functionType.parameters.map((p) => {
    const bridged = new SwiftCxxBridgedType(p)
    // TODO: .getTypeCode('c++') should use the swift::T types.
    return `${bridged.getTypeCode('c++')} ${p.escapedName}`
  })

  const swiftClassName = getSwiftFunctionClassName(functionType)
  const requiredImports = functionType
    .getRequiredImports('swift')
    .map((i) => `import ${i.name}`)
  requiredImports.push('import NitroModules')
  const imports = requiredImports.filter(isNotDuplicate)
  const cppType = functionType.getCode('c++', { includeNameInfo: false })

  // TODO: Pass std::function via rvalue (&& / consuming) once Swift cxx-interop supports that

  const swiftCode = `
${createFileMetadataString(`${swiftClassName}.swift`)}

import Foundation
${imports.join('\n')}

/**
 * Wraps a Swift \`${functionType.getCode('swift')}\` as a class.
 * This class can be used from C++, e.g. to wrap the Swift closure as a \`std::function\`.
 */
public final class ${swiftClassName} {
  public typealias bridge = ${bridgeNamespace}

  public let closure: ${functionType.getCode('swift')}

  public init(_ closure: @escaping ${functionType.getCode('swift')}) {
    self.closure = closure
  }
  public init(fromCxx function: consuming bridge.${bridge.specializationName}) {
    self.closure = { (${argsTypes.join(', ')}) -> ${returnType} in
      fatalError("not yet implemented!")
    }
  }

  @inline(__always)
  public func call(${argsTypes.join(', ')}) -> ${returnType} {
    return self.closure(${argsForward.join(', ')})
  }
}
  `.trim()
  const cppHeaderCode = `
${createFileMetadataString(`${swiftClassName}+Swift.hpp`)}

#pragma once

#include <functional>

namespace ${iosNamespace} {
  class ${swiftClassName};
}
namespace margelo::nitro {
  template <typename T, typename Enable>
  struct SwiftConverter;
}

namespace margelo::nitro {
  template <>
  struct SwiftConverter<${cppType}> {
    using SwiftType = ${iosNamespace}::${swiftClassName};
    static ${cppType} fromSwift(const ${iosNamespace}::${swiftClassName}& swiftFunc);
    static ${iosNamespace}::${swiftClassName} toSwift(const ${cppType}& cppFunc);
  };
}
  `.trim()
  const cppSourceCode = `
${createFileMetadataString(`${swiftClassName}+Swift.cpp`)}

#include "${swiftClassName}+Swift.hpp"
#include <functional>
#include "${getUmbrellaHeaderName()}"
#include <NitroModules/SwiftConverter.hpp>

namespace margelo::nitro {

  ${cppType} SwiftConverter<${cppType}>::fromSwift(const ${iosNamespace}::${swiftClassName}& swiftFunc) {
    return [swiftFunc = /* copy */ swiftFunc](${paramsCpp.join(', ')}) mutable -> ${functionType.returnType.getCode('c++')} {
      return swiftFunc.call(${argsForward.join(', ')});
    };
  }

  ${iosNamespace}::${swiftClassName} SwiftConverter<${cppType}>::toSwift(const ${cppType}& cppFunc) {
    return ${iosNamespace}::${swiftClassName}::init(cppFunc);
  }

}
  `.trim()

  return [
    {
      content: swiftCode,
      language: 'swift',
      name: `${swiftClassName}.swift`,
      platform: 'ios',
      subdirectory: [],
    },
    {
      content: cppHeaderCode,
      language: 'c++',
      name: `${swiftClassName}+Swift.hpp`,
      platform: 'ios',
      subdirectory: [],
    },
    {
      content: cppSourceCode,
      language: 'c++',
      name: `${swiftClassName}+Swift.cpp`,
      platform: 'ios',
      subdirectory: [],
    },
  ]
}
