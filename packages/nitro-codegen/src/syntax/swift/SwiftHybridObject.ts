import { indent } from '../../stringUtils.js'
import { createFileMetadataString } from '../helpers.js'
import type { HybridObjectSpec } from '../HybridObjectSpec.js'
import { Method } from '../Method.js'
import type { Property } from '../Property.js'
import type { SourceFile } from '../SourceFile.js'

function getPropertyForwardImplementation(property: Property): string {
  const type = property.type.getCode('swift')
  const getter = `
get {
  return self.implementation.${property.name}
}
  `.trim()
  const setter = `
set {
  self.implementation.${property.name} = newValue
}
  `.trim()

  const body = [getter]
  if (!property.isReadonly) {
    body.push(setter)
  }

  const code = `
public var ${property.name}: ${type} {
  ${indent(body.join('\n'), '  ')}
}
  `
  return code.trim()
}

function getMethodForwardImplementation(method: Method): string {
  const returnType = method.returnType.getCode('swift')
  const params = method.parameters.map((p) => p.getCode('swift'))
  const passParams = method.parameters.map((p) => `${p.name}: ${p.name}`)
  return `
func ${method.name}(${params.join(', ')}) -> Result<${returnType}, Error> {
  do {
    let result = try self.implementation.${method.name}(${passParams.join(', ')})
    return .success(result)
  } catch {
    return .failure("TODO: Error message!")
  }
}
  `.trim()
}

export function createSwiftHybridObject(spec: HybridObjectSpec): SourceFile[] {
  const protocolName = `${spec.name}Spec`
  const properties = spec.properties.map((p) => p.getCode('swift')).join('\n')
  const methods = spec.methods.map((p) => p.getCode('swift')).join('\n')

  const protocolCode = `
${createFileMetadataString(`${protocolName}.swift`)}

import Foundation

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

  const propertiesBridge = spec.properties
    .map((p) => getPropertyForwardImplementation(p))
    .join('\n\n')
  const methodsBridge = spec.methods
    .map((m) => getMethodForwardImplementation(m))
    .join('\n\n')

  const swiftBridgeCode = `
${createFileMetadataString(`${protocolName}Cxx.swift`)}

import Foundation

/**
 * A class implementation that bridges ${protocolName} over to C++.
 * In C++, we cannot use Swift protocols - so we need to wrap it in a class to make it strongly defined.
 *
 * Also, some Swift types need to be bridged with special handling:
 * - Enums need to be wrapped in Structs, otherwise they cannot be accessed bi-directionally (Swift bug: https://github.com/swiftlang/swift/issues/75330)
 * - Other HostObjects need to be wrapped/unwrapped from the Swift TCxx wrapper
 * - Throwing methods need to be wrapped with a Result<T, Error> type, as exceptions cannot be propagated to C++
 */
public class ${protocolName}Cxx {
  private let implementation: ${protocolName}

  public init(_ implementation: ${protocolName}) {
    self.implementation = implementation
  }

  // Properties
  ${indent(propertiesBridge, '  ')}

  // Methods
  ${indent(methodsBridge, '  ')}
}

  `

  const files: SourceFile[] = []
  files.push({
    content: protocolCode,
    language: 'swift',
    name: `${protocolName}.swift`,
  })
  files.push({
    content: swiftBridgeCode,
    language: 'swift',
    name: `${protocolName}Cxx.swift`,
  })
  return files
}
