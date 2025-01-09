import type { HybridView } from 'react-native-nitro-modules'

export interface TestView extends HybridView {
  someProp: string
  someCallback: (value: number) => void
  someRefMethod(): number
}
