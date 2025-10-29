import { NitroConfig } from '../../config/NitroConfig.js'
import { indent } from '../../utils.js'
import { createSwiftHybridViewManager } from '../../views/swift/SwiftHybridViewManager.js'
import { getHybridObjectName } from '../getHybridObjectName.js'
import {
  createFileMetadataString,
  escapeCppName,
  isNotDuplicate,
} from '../helpers.js'
import type { HybridObjectSpec } from '../HybridObjectSpec.js'
import type { SourceFile } from '../SourceFile.js'
import { HybridObjectType } from '../types/HybridObjectType.js'
import { SwiftCxxBridgedType } from './SwiftCxxBridgedType.js'
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
  const bridgeNamespace = NitroConfig.current.getSwiftBridgeNamespace('swift')
  const bridgedType = new SwiftCxxBridgedType(new HybridObjectType(spec))
  const bridgeFunc = bridgedType.getRequiredBridge()
  const cxxType = bridgedType.getTypeCode('swift')
  let upcastCxxOverride: string = ''

  if (bridgeFunc == null) {
    throw new Error(`HybridObject's C++ -> Swift Bridge func cannot be null!`)
  }

  const protocolBaseClasses = ['HybridObject']
  const baseClasses: string[] = []
  if (spec.baseTypes.length > 0) {
    if (spec.baseTypes.length > 1) {
      throw new Error(
        `${name.T}: Inheriting from multiple HybridObject bases is not yet supported in Swift!`
      )
    }
    const base = spec.baseTypes[0]!
    const baseName = getHybridObjectName(base.name)
    protocolBaseClasses.push(`${baseName.HybridTSpec}_protocol`)
    baseClasses.push(`${baseName.HybridTSpec}_base`)
    const baseBridge = new SwiftCxxBridgedType(new HybridObjectType(base))
    const upcastFuncName = escapeCppName(`upcast_${name.T}_to_${baseName.T}`)
    upcastCxxOverride = `
open override func getCxxPart() -> ${baseBridge.getTypeCode('swift')} {
  let __child: ${cxxType} = getCxxPart()
  return bridge.${upcastFuncName}(__child)
}
    `.trim()
  }
  if (spec.isHybridView) {
    protocolBaseClasses.push('HybridView')
  }

  const imports = ['import NitroModules']
  imports.push(
    ...extraImports.map((i) => `import ${i.name}`).filter(isNotDuplicate)
  )

  const hasBase = baseClasses.length > 0
  let initializer: string
  if (hasBase) {
    initializer = `public override init() { super.init() }`
  } else {
    initializer = `public init() { }`
  }
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

public extension ${protocolName}_protocol {
  /// Default implementation of \`\`HybridObject.toString\`\`
  func toString() -> String {
    return "[HybridObject ${name.T}]"
  }
}

open class ${protocolName}_base${hasBase ? `: ${baseClasses.join(', ')}` : ''} {
  public typealias bridge = ${bridgeNamespace}

  ${indent(initializer, '  ')}

  ${indent(upcastCxxOverride, '  ')}

  open func getCxxPart() -> ${cxxType} {
    let __unsafe = Unmanaged.passRetained(self).toOpaque()
    let __cxxPart = bridge.${bridgeFunc.funcName}(__unsafe)
    return __cxxPart
  }
}

public typealias ${protocolName} = ${protocolName}_protocol & ${protocolName}_base
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
