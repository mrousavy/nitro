import type { HybridView } from 'react-native-nitro-modules'

export interface TestView extends HybridView {
  isBlue: boolean
  someCallback: () => void
}
