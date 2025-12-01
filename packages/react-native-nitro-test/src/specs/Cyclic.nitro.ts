import type { HybridObject } from 'react-native-nitro-modules'

export interface Node {
  node?: Node
}

export interface Cyclic
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  node?: Node
}
