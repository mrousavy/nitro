import { indent } from '../../utils.js'
import { createSwiftHybridViewManager } from '../../views/swift/SwiftHybridViewManager.js'
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

  const protocolBaseClasses = ['HybridObject']
  const classBaseClasses: string[] = []
  for (const base of spec.baseTypes) {
    const baseName = getHybridObjectName(base.name)
    protocolBaseClasses.push(`${baseName.HybridTSpec}_protocol`)
    classBaseClasses.push(`${baseName.HybridTSpec}_base`)
  }
  if (spec.isHybridView) {
    protocolBaseClasses.push('HybridView')
  }

  const hasBaseClass = classBaseClasses.length > 0
  let initFunc: string
  if (hasBaseClass) {
    initFunc = `
public override init() {
  super.init()
}
`.trim()
  } else {
    initFunc = `public init() { }`
  }

  const protocolCode = `
${createFileMetadataString(`${protocolName}.swift`)}

import Foundation
import NitroModules

/// See \`\`${protocolName}\`\`
public protocol ${protocolName}_protocol: ${protocolBaseClasses.join(', ')} {
  // Properties
  ${indent(properties, '  ')}

  // Methods
  ${indent(methods, '  ')}
}

/// See \`\`${protocolName}\`\`
public class ${protocolName}_base${classBaseClasses.length > 0 ? `: ${classBaseClasses.join(',')}` : ''} {
  private weak var cxxWrapper: ${name.HybridTSpecCxx}? = nil

  public ${hasBaseClass ? 'override func' : 'func'} getCxxWrapper() -> ${name.HybridTSpecCxx} {
  #if DEBUG
    guard self is ${name.HybridTSpec} else {
      fatalError("\`self\` is not a \`${name.HybridTSpec}\`! Did you accidentally inherit from \`${name.HybridTSpec}_base\` instead of \`${name.HybridTSpec}\`?")
    }
  #endif
    if let cxxWrapper = self.cxxWrapper {
      return cxxWrapper
    } else {
      let cxxWrapper = ${name.HybridTSpecCxx}(self as! ${name.HybridTSpec})
      self.cxxWrapper = cxxWrapper
      return cxxWrapper
    }
  }

  ${indent(initFunc, '  ')}
}

/**
 * A Swift base-protocol representing the ${spec.name} HybridObject.
 * Implement this protocol to create Swift-based instances of ${spec.name}.
 * \`\`\`swift
 * class ${name.HybridT} : ${protocolName} {
 *   // ...
 * }
 * \`\`\`
 */
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

  if (spec.isHybridView) {
    const viewFiles = createSwiftHybridViewManager(spec)
    files.push(...viewFiles)
  }

  return files
}
