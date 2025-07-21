import type { HybridObject } from 'react-native-nitro-modules'

export interface Image
  extends HybridObject<{ android: 'kotlin'; ios: 'swift' }> {
  readonly path: string
}
