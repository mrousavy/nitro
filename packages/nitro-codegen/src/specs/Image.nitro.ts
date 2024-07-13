import type { HybridObject } from 'react-native-nitro-modules'

export interface Image extends HybridObject<{ ios: 'c++' }> {
  readonly width: number
  readonly height: number
  readonly data: ArrayBuffer
}
