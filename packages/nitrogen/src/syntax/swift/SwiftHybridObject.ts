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

  const protocolBaseClasses = ['AnyObject']
  const classBaseClasses: string[] = []
  for (const base of spec.baseTypes) {
    const baseName = getHybridObjectName(base.name)
    protocolBaseClasses.push(`${baseName.HybridTSpec}_protocol`)
    classBaseClasses.push(`${baseName.HybridTSpec}_base`)
  }

  const baseMembers: string[] = []
  if (classBaseClasses.length === 0) {
    // It doesn't have a base class - implement hybridContext
    classBaseClasses.push('HybridObjectSpec')
    baseMembers.push(`public var hybridContext = margelo.nitro.HybridContext()`)
    baseMembers.push(`public var memorySize: Int { return getSizeOf(self) }`)
  }

  const protocolCode = `
${createFileMetadataString(`${protocolName}.swift`)}

import Foundation
import NitroModules

/**
 * A Swift protocol representing the ${spec.name} HybridObject.
 * Implement this protocol to create Swift-based instances of ${spec.name}.
 */
public protocol ${protocolName}_protocol: ${protocolBaseClasses.join(', ')} {
  // Properties
  ${indent(properties, '  ')}

  // Methods
  ${indent(methods, '  ')}
}

public class ${protocolName}_base: ${classBaseClasses.join(', ')} {
  ${indent(baseMembers.join('\n'), '  ')}
}

public typealias ${protocolName} = ${protocolName}_protocol & ${protocolName}_base
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
