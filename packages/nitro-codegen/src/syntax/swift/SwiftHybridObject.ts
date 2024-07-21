import { indent } from '../../stringUtils.js'
import { createFileMetadataString } from '../helpers.js'
import type { HybridObjectSpec } from '../HybridObjectSpec.js'
import type { SourceFile } from '../SourceFile.js'
import { createSwiftHybridObjectCxxBridge } from './SwiftHybridObjectBridge.js'

export function createSwiftHybridObject(spec: HybridObjectSpec): SourceFile[] {
  const protocolName = `${spec.name}Spec`
  const properties = spec.properties.map((p) => p.getCode('swift')).join('\n')
  const methods = spec.methods.map((p) => p.getCode('swift')).join('\n')

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
 * public class ${spec.name} : ${protocolName} {
 *   // Initialize HybridContext
 *   var hybridContext = margelo.nitro.HybridContext()
 *
 *   // ...
 * }
 * \`\`\`
 */
public protocol ${protocolName} {
  // Nitro Modules Hybrid Context
  var hybridContext: margelo.nitro.HybridContext { get set }

  // Properties
  ${indent(properties, '  ')}

  // Methods
  ${indent(methods, '  ')}
}
  `

  const swiftBridge = createSwiftHybridObjectCxxBridge(protocolName, spec)

  const files: SourceFile[] = []
  files.push({
    content: protocolCode,
    language: 'swift',
    name: `${protocolName}.swift`,
    platform: 'ios',
  })
  files.push(...swiftBridge)
  return files
}
