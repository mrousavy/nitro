import { NitroConfig } from '../../config/NitroConfig.js'
import { createFileMetadataString } from '../helpers.js'
import type { FileWithReferencedTypes } from '../SourceFile.js'
import type { FunctionType } from '../types/FunctionType.js'
import { BRIDGE_NAMESPACE } from './SwiftHybridObjectBridge.js'

export function createSwiftFunctionBridge(
  func: FunctionType
): FileWithReferencedTypes {
  const fullName = NitroConfig.getCxxNamespace('swift', func.specializationName)

  const code = `
${createFileMetadataString(`${func.specializationName}.swift`)}

import NitroModules

/**
 * Holds the C++ function \`${func.specializationName}\`.
 */
public typealias ${func.specializationName} = ${fullName}

public extension ${func.specializationName} {
  private typealias bridge = ${BRIDGE_NAMESPACE}

}
  `.trim()

  return {
    content: code,
    language: 'swift',
    name: `${func.specializationName}.swift`,
    platform: 'ios',
    subdirectory: [],
    referencedTypes: [func.returnType, ...func.parameters],
  }
}
