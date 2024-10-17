import { indent } from '../../utils.js'
import { getHybridObjectName } from '../getHybridObjectName.js'
import { createFileMetadataString } from '../helpers.js'
import type { HybridObjectSpec } from '../HybridObjectSpec.js'
import type { SourceFile } from '../SourceFile.js'
import { createSwiftHybridObjectCxxBridge } from './SwiftHybridObjectBridge.js'

export function createSwiftHybridObject(spec: HybridObjectSpec): SourceFile[] {
  const name = getHybridObjectName(spec.name)
  const protocolName = name.HybridTSpec
  const properties = spec.properties.map((p) => p.getCode('swift')).join('\n')
  const methods = spec.methods.map((p) => p.getCode('swift')).join('\n')

  const baseClasses = ['HybridObjectSpec']
  for (const base of spec.baseTypes) {
    const baseName = getHybridObjectName(base.name)
    baseClasses.push(baseName.HybridTSpec)
  }

  const protocolCode = `
${createFileMetadataString(`${protocolName}.swift`)}

import Foundation
import NitroModules

/**
 * A Swift protocol representing the ${spec.name} HybridObject.
 * Implement this protocol to create Swift-based instances of ${spec.name}.
 *
 * When implementing this protocol, make sure to initialize \`hybridContext\` - example:
 * \`\`\`
 * public class ${name.HybridT} : ${protocolName} {
 *   // Initialize HybridContext
 *   var hybridContext = margelo.nitro.HybridContext()
 *
 *   // Return size of the instance to inform JS GC about memory pressure
 *   var memorySize: Int {
 *     return getSizeOf(self)
 *   }
 *
 *   // ...
 * }
 * \`\`\`
 */
public protocol ${protocolName}: AnyObject, ${baseClasses.join(', ')} {
  // Properties
  ${indent(properties, '  ')}

  // Methods
  ${indent(methods, '  ')}
}
  `

  const swiftBridge = createSwiftHybridObjectCxxBridge(spec)

  const files: SourceFile[] = []
  files.push({
    content: protocolCode,
    language: 'swift',
    name: `${protocolName}.swift`,
    subdirectory: [],
    platform: 'ios',
  })
  files.push(...swiftBridge)
  return files
}
