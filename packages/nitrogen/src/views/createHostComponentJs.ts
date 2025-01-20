import type { Language } from '../getPlatformSpecs.js'
import type { HybridObjectSpec } from '../syntax/HybridObjectSpec.js'
import type { SourceFile } from '../syntax/SourceFile.js'
import { getHybridObjectName } from '../syntax/getHybridObjectName.js'
import { indent } from '../utils.js'

export function createHostComponentJs(spec: HybridObjectSpec): SourceFile[] {
  const { T } = getHybridObjectName(spec.name)
  const props = spec.properties.map((p) => `"${p.name}": true`)

  const code = `
{
  "uiViewClassName": "${T}",
  "supportsRawText": false,
  "bubblingEventTypes": {},
  "directEventTypes": {},
  "validAttributes": {
    ${indent(props.join(',\n'), '    ')}
  }
}
  `.trim()

  return [
    {
      content: code,
      language: 'json' as Language,
      name: `${T}Config.json`,
      platform: 'shared',
      subdirectory: [],
    },
  ]
}
