import { indent } from '../../utils.js'
import { getHybridObjectName } from '../getHybridObjectName.js'
import { createFileMetadataString } from '../helpers.js'
import type { HybridObjectSpec } from '../HybridObjectSpec.js'
import type { Method } from '../Method.js'
import type { Property } from '../Property.js'
import type { SourceFile } from '../SourceFile.js'
import { SwiftCxxBridgedType } from './SwiftCxxBridgedType.js'

/**
 * Wraps the given {@linkcode spec} (a protocol/interface) in a Swift class, so it is strongly
 * defined and can be used from C++ (Swift protocols cannot be used from C++ yet)
 */
export function createSwiftInterfaceWrapper(
  spec: HybridObjectSpec
): SourceFile {
  const name = getHybridObjectName(spec.name)

  const forwardedProperties = spec.properties
    .map((p) => getPropertyForwardImplementation(p))
    .join('\n\n')
  const forwardedMethods = spec.methods
    .map((m) => getMethodForwardImplementation(m))
    .join('\n\n')

  const code = `
${createFileMetadataString(`${name.HybridTSpecCxx}.swift`)}

import Foundation
import NitroModules

/**
 * A class implementation that bridges ${name.HybridTSpec} over to C++.
 * In C++, we cannot use Swift protocols - so we need to wrap it in a class to make it strongly defined.
 */
public final class ${name.HybridTSpecCxx} {
  private(set) var implementation: ${name.HybridTSpec}

  public init(_ implementation: ${name.HybridTSpec}) {
    self.implementation = implementation
  }

  // HybridObject C++ part
  public var hybridContext: margelo.nitro.HybridContext {
    get {
      return self.implementation.hybridContext
    }
    set {
      self.implementation.hybridContext = newValue
    }
  }

  // Memory size of the Swift class (plus size of any other allocations)
  public var memorySize: Int {
    return self.implementation.memorySize
  }

  // Properties
  ${indent(forwardedProperties, '  ')}

  // Methods
  ${indent(forwardedMethods, '  ')}
}
  `

  return {
    language: 'swift',
    content: code,
    name: `${name.HybridTSpecCxx}.swift`,
    platform: 'ios',
    subdirectory: [],
  }
}

function getPropertyForwardImplementation(property: Property): string {
  const bridgedType = new SwiftCxxBridgedType(property.type)
  const getter = `
@inline(__always)
get {
  return self.implementation.${property.name}
}
  `.trim()
  const setter = `
@inline(__always)
set {
  self.implementation.${property.name} = newValue
}
  `.trim()

  const body = [getter]
  if (!property.isReadonly) {
    body.push(setter)
  }

  const code = `
public var ${property.name}: ${bridgedType.getTypeCode('swift')} {
  ${indent(body.join('\n'), '  ')}
}
  `
  return code.trim()
}

function getMethodForwardImplementation(method: Method): string {
  const returnType = new SwiftCxxBridgedType(method.returnType)
  const params = method.parameters.map((p) => {
    const bridgedType = new SwiftCxxBridgedType(p.type)
    return `${p.name}: ${bridgedType.getTypeCode('swift')}`
  })
  const passParams = method.parameters.map((p) => {
    return `${p.name}: ${p.name}`
  })
  let body: string
  if (returnType.hasType) {
    // We have a return value, call func, and then convert the `result` to C++
    body = `return try self.implementation.${method.name}(${passParams.join(', ')})`
  } else {
    // No return (void), just call func
    body = `try self.implementation.${method.name}(${passParams.join(', ')})`
  }

  // TODO: Use @inlinable or @inline(__always)?
  return `
@inline(__always)
public func ${method.name}(${params.join(', ')}) -> ${returnType.getTypeCode('swift')} {
  do {
    ${indent(body.trim(), '    ')}
  } catch {
    // TODO: Wait for https://github.com/swiftlang/swift/issues/75290
    fatalError("Swift errors cannot be propagated to C++ yet! If you want to throw errors, consider using a Promise (async) or a variant type (sync) instead.")
  }
}
  `.trim()
}
