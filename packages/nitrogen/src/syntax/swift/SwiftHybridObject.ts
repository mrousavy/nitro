import { indent } from '../../utils.js'
import { createSwiftHybridViewManager } from '../../views/swift/SwiftHybridViewManager.js'
import { getHybridObjectName } from '../getHybridObjectName.js'
import { createFileMetadataString, isNotDuplicate } from '../helpers.js'
import type { HybridObjectSpec } from '../HybridObjectSpec.js'
import type { SourceFile } from '../SourceFile.js'
import { HybridObjectType } from '../types/HybridObjectType.js'
import { createSwiftHybridObjectCxxBridge } from './SwiftHybridObjectBridge.js'

export function createSwiftHybridObject(spec: HybridObjectSpec): SourceFile[] {
  const name = getHybridObjectName(spec.name)
  const protocolName = name.HybridTSpec
  const properties = spec.properties.map((p) => p.getCode('swift')).join('\n')
  const methods = spec.methods.map((p) => p.getCode('swift')).join('\n')
  const extraImports = [
    ...spec.properties.flatMap((p) => p.getRequiredImports('swift')),
    ...spec.methods.flatMap((m) => m.getRequiredImports('swift')),
    ...spec.baseTypes.flatMap((b) =>
      new HybridObjectType(b).getRequiredImports('swift')
    ),
  ]

  const protocolBaseClasses = ['HybridObject']
  const classBaseClasses: string[] = []
  if (spec.baseTypes.length > 0) {
    if (spec.baseTypes.length > 1) {
      throw new Error(
        `${name.T}: Inheriting from multiple HybridObject bases is not yet supported in Swift!`
      )
    }
    const base = spec.baseTypes[0]!
    const baseName = getHybridObjectName(base.name)
    protocolBaseClasses.push(`${baseName.HybridTSpec}_protocol`)
    classBaseClasses.push(`${baseName.HybridTSpec}_base`)
  }
  if (spec.isHybridView) {
    protocolBaseClasses.push('HybridView')
  }

  const hasBaseClass = classBaseClasses.length > 0
  const baseMembers: string[] = []
  baseMembers.push(`private weak var cxxWrapper: ${name.HybridTSpecCxx}? = nil`)
  if (hasBaseClass) {
    baseMembers.push(`public override init() { super.init() }`)
  } else {
    baseMembers.push(`public init() { }`)
  }
  baseMembers.push(
    `
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
}`.trim()
  )

  const imports = ['import NitroModules']
  imports.push(
    ...extraImports.map((i) => `import ${i.name}`).filter(isNotDuplicate)
  )

  const protocolCode = `
${createFileMetadataString(`${protocolName}.swift`)}

import Foundation
${imports.join('\n')}

/// See \`\`${protocolName}\`\`
public protocol ${protocolName}_protocol: ${protocolBaseClasses.join(', ')} {
  // Properties
  ${indent(properties, '  ')}

  // Methods
  ${indent(methods, '  ')}
}

/// See \`\`${protocolName}\`\`
open class ${protocolName}_base${classBaseClasses.length > 0 ? `: ${classBaseClasses.join(',')}` : ''} {
  ${indent(baseMembers.join('\n'), '  ')}
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
