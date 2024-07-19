import { indent } from '../../stringUtils.js'
import { createFileMetadataString } from '../helpers.js'
import type { HybridObjectSpec } from '../HybridObjectSpec.js'
import type { SourceFile } from '../SourceFile.js'

export function createSwiftHybridObject(spec: HybridObjectSpec): SourceFile[] {
  const properties = spec.properties.map((p) => p.getCode('swift')).join('\n')
  const methods = spec.methods.map((p) => p.getCode('swift')).join('\n')

  const protocolCode = `
${createFileMetadataString(`${spec.name}.swift`)}

import Foundation

public protocol ${spec.name} {
  // Properties
  ${indent(properties, '  ')}

  // Methods
  ${indent(methods, '  ')}
}
  `

  const files: SourceFile[] = []
  files.push({
    content: protocolCode,
    language: 'swift',
    name: `${spec.name}.swift`,
  })
  return files
}
