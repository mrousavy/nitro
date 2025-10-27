import type { HybridObject } from 'react-native-nitro-modules'

// This is a simple `HybridObject` with just one value.
export interface Base
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  readonly baseValue: number
}
