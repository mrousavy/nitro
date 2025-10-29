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
  const methods = spec.methods.map((m) => m.getCode('swift')).join('\n')
  const extraImports = [
    ...spec.properties.flatMap((p) => p.getRequiredImports('swift')),
    ...spec.methods.flatMap((m) => m.getRequiredImports('swift')),
    ...spec.baseTypes.flatMap((b) =>
      new HybridObjectType(b).getRequiredImports('swift')
    ),
  ]

  const protocolBaseClasses = ['HybridObject']
  if (spec.baseTypes.length > 0) {
    if (spec.baseTypes.length > 1) {
      throw new Error(
        `${name.T}: Inheriting from multiple HybridObject bases is not yet supported in Swift!`
      )
    }
    const base = spec.baseTypes[0]!
    const baseName = getHybridObjectName(base.name)
    protocolBaseClasses.push(`${baseName.HybridTSpec}`)
  }
  if (spec.isHybridView) {
    protocolBaseClasses.push('HybridView')
  }

  const imports = ['import NitroModules']
  imports.push(
    ...extraImports.map((i) => `import ${i.name}`).filter(isNotDuplicate)
  )

  const protocolCode = `
${createFileMetadataString(`${protocolName}.swift`)}

import Foundation
${imports.join('\n')}

/// See \`\`${protocolName}\`\`
public protocol ${protocolName}: ${protocolBaseClasses.join(', ')} {
  // Properties
  ${indent(properties, '  ')}

  // Methods
  ${indent(methods, '  ')}
}

public extension ${protocolName} {
  /// Default implementation of \`\`HybridObject.toString\`\`
  func toString() -> String {
    return "[HybridObject ${name.T}]"
  }
}
  `.trim()

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
