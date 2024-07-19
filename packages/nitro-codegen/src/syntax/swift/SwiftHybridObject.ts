import { createFileMetadataString } from '../helpers.js'
import type { HybridObjectSpec } from '../HybridObjectSpec.js'
import type { SourceFile } from '../SourceFile.js'

export function createSwiftHybridObject(spec: HybridObjectSpec): SourceFile[] {
  const protocolCode = `
${createFileMetadataString(`${spec.name}.swift`)}

import Foundation

protocol ${spec.name} {

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
