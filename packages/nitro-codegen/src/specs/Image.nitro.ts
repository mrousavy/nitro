import type { HybridObject } from 'react-native-nitro-modules'

export interface Image extends HybridObject<{}> {
  readonly width: number
  readonly height: number
  readonly data: ArrayBuffer
}
