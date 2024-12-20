import { indent } from '../../utils.js'
import { createFileMetadataString } from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import type { FunctionType } from '../types/FunctionType.js'
import { SwiftCxxBridgedType } from './SwiftCxxBridgedType.js'

export function createSwiftFunctionBridge(
  functionType: FunctionType
): SourceFile {
  const argsTypes = functionType.parameters.map((p) => {
    const bridged = new SwiftCxxBridgedType(p)
    return `${p.escapedName}: ${bridged.getTypeCode('swift')}`
  })
  const returnType = new SwiftCxxBridgedType(functionType.returnType)
  const argsForward = functionType.parameters.map((p) => {
    const bridged = new SwiftCxxBridgedType(p)
    return bridged.parseFromCppToSwift(p.escapedName, 'swift')
  })

  const code = `
${createFileMetadataString(`${functionType.specializationName}.swift`)}

/**
 * Represents the JS function \`${functionType.jsName}\`, wrappable as a C++ std::function.
 */
public class ${functionType.specializationName} final {
  private let closure: ${functionType.getCode('swift')}

  public init(_ closure: @escaping ${functionType.getCode('swift')}) {
    self.closure = closure
  }

  public func call(${argsTypes.join(', ')}) -> ${returnType.getTypeCode('swift')} {
    let __result: ${functionType.returnType.getCode('swift')} = self.closure(${indent(argsForward.join(', '), '    ')})
    return ${indent(returnType.parseFromSwiftToCpp('__result', 'swift'), '    ')}
  }

  /**
   * Casts this instance to a retained unsafe raw pointer.
   * This acquires one additional strong reference on the object!
   */
  public func toUnsafe() -> UnsafeMutableRawPointer {
    return Unmanaged.passRetained(self).toOpaque()
  }

  /**
   * Casts an unsafe pointer to a \`${functionType.specializationName}\`.
   * The pointer has to be a retained opaque \`Unmanaged<${functionType.specializationName}>\`.
   * This removes one strong reference from the object!
   */
  public static func fromUnsafe(_ pointer: UnsafeMutableRawPointer) -> ${functionType.specializationName} {
    return Unmanaged<${functionType.specializationName}>.fromOpaque(pointer).takeRetainedValue()
  }
}
  `.trim()

  return {
    content: code,
    language: 'swift',
    name: `${functionType.specializationName}.swift`,
    platform: 'ios',
    subdirectory: [],
  }
}
