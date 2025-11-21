import type { HybridViewConfig } from 'react-native-nitro-modules'
import type { NitroConfig } from '../config/NitroConfig.js'
import type { Language } from '../getPlatformSpecs.js'
import type { Method } from './Method.js'
import type { Property } from './Property.js'

export interface HybridObjectSpec {
  name: string
  language: Language
  properties: Property[]
  methods: Method[]
  baseTypes: HybridObjectSpec[]
  config: NitroConfig
  // When a hybridViewConfig is set it represents a HybridView instead of a HybridObject
  hybridViewConfig: HybridViewConfig | null
}
