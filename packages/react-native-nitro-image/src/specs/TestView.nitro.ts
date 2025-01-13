import type { HybridView } from 'react-native-nitro-modules'

export interface TestView extends HybridView {
  someProp: boolean
  someCallback: (someParam: number) => void
  someFunc(someParam: number): boolean
}
