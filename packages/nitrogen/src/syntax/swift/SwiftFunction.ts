import { getUmbrellaHeaderName } from '../../autolinking/ios/createSwiftUmbrellaHeader.js'
import { NitroConfig } from '../../config/NitroConfig.js'
import { indent } from '../../utils.js'
import {
  createFileMetadataString,
  escapeCppName,
  isNotDuplicate,
} from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import type { FunctionType } from '../types/FunctionType.js'
import { SwiftCxxBridgedType } from './SwiftCxxBridgedType.js'

export function createSwiftFunctionBridge(
  functionType: FunctionType
): SourceFile[] {
  const results: SourceFile[] = []

  // TODO: Remove
  // Old Code:
  {
    const swiftClassName = functionType.specializationName
    const bridgeNamespace = NitroConfig.current.getSwiftBridgeNamespace('swift')

    const bridgedFunction = new SwiftCxxBridgedType(functionType)
    const bridge = bridgedFunction.getRequiredBridge()
    if (bridge == null) throw new Error(`FunctionType has to have a bridge!`)

    const argsTypes = functionType.parameters.map((p) => {
      const bridged = new SwiftCxxBridgedType(p)
      return `${p.escapedName}: ${bridged.getTypeCode('swift')}`
    })
    const returnType = new SwiftCxxBridgedType(functionType.returnType)
    const argsForward = functionType.parameters.map((p) => {
      const bridged = new SwiftCxxBridgedType(p)
      return bridged.parseFromCppToSwift(p.escapedName, 'swift')
    })

    let body: string
    if (functionType.returnType.kind === 'void') {
      body = `
self.closure(${argsForward.join(', ')})
    `.trim()
    } else {
      body = `
let __result: ${functionType.returnType.getCode('swift')} = self.closure(${argsForward.join(', ')})
return ${returnType.parseFromSwiftToCpp('__result', 'swift')}
    `.trim()
    }

    const requiredImports = functionType
      .getRequiredImports('swift')
      .map((i) => `import ${i.name}`)
    requiredImports.push('import NitroModules')
    const imports = requiredImports.filter(isNotDuplicate)

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

  private let closure: ${functionType.getCode('swift')}

  public init(_ closure: @escaping ${functionType.getCode('swift')}) {
    self.closure = closure
  }

  /**
   * Casts this instance to a retained unsafe raw pointer.
   * This acquires one additional strong reference on the object!
   */
  @inline(__always)
  public func toUnsafe() -> UnsafeMutableRawPointer {
    return Unmanaged.passRetained(self).toOpaque()
  }

  /**
   * Casts an unsafe pointer to a \`${swiftClassName}\`.
   * The pointer has to be a retained opaque \`Unmanaged<${swiftClassName}>\`.
   * This removes one strong reference from the object!
   */
  @inline(__always)
  public static func fromUnsafe(_ pointer: UnsafeMutableRawPointer) -> ${swiftClassName} {
    return Unmanaged<${swiftClassName}>.fromOpaque(pointer).takeRetainedValue()
  }

  @inline(__always)
  public func call(${argsTypes.join(', ')}) -> ${returnType.getTypeCode('swift')} {
    ${indent(body, '    ')}
  }
}
  `.trim()
    results.push({
      content: swiftCode,
      language: 'swift',
      name: `${swiftClassName}.swift`,
      platform: 'ios',
      subdirectory: [],
    })
  }

  // New Code:
  if (
    // only generate (Double) -> Void for now.
    functionType.parameters.length === 1 &&
    functionType.parameters[0]?.kind === 'number' &&
    functionType.returnType.kind === 'void'
  ) {
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

    const swiftClassName = escapeCppName(
      `Func_${functionType.parameters.map((p) => p.getCode('swift', { fullyQualified: false })).join('_')}_${returnType}`
    )
    const requiredImports = functionType
      .getRequiredImports('swift')
      .map((i) => `import ${i.name}`)
    requiredImports.push('import NitroModules')
    const imports = requiredImports.filter(isNotDuplicate)

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
${createFileMetadataString(`${swiftClassName}.hpp`)}

#include <NitroModules/SwiftConverter.hpp>
#include <functional>

namespace ${iosNamespace} {
  class ${swiftClassName};
}

namespace margelo::nitro {
  template <>
  struct SwiftConverter<${functionType.getCode('c++')}> {
    using SwiftType = ${iosNamespace}::${swiftClassName};
    static ${functionType.getCode('c++')} fromSwift(const ${iosNamespace}::${swiftClassName}& swiftFunc);
    static ${iosNamespace}::${swiftClassName} toSwift(const ${functionType.getCode('c++')}& cppFunc);
  };
}
  `.trim()
    const cppSourceCode = `
${createFileMetadataString(`${swiftClassName}.cpp`)}

#include "${swiftClassName}.hpp"
#include <NitroModules/SwiftConverter.hpp>
#include <functional>
#include "${getUmbrellaHeaderName()}"

namespace margelo::nitro {

  ${functionType.getCode('c++')} SwiftConverter<${functionType.getCode('c++')}>::fromSwift(const ${iosNamespace}::${swiftClassName}& swiftFunc) {
    return [swiftFunc = /* copy */ swiftFunc](${paramsCpp.join(', ')}) mutable -> ${functionType.returnType.getCode('c++')} {
      return swiftFunc.call(${argsForward.join(', ')});
    };
  }

  ${iosNamespace}::${swiftClassName} SwiftConverter<${functionType.getCode('c++')}>::toSwift(const ${functionType.getCode('c++')}& cppFunc) {
    return ${iosNamespace}::${swiftClassName}::init(cppFunc);
  }

}
  `.trim()

    results.push(
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
      }
    )
  }

  return results
}
