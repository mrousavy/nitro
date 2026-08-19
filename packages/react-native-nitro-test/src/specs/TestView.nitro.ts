import type {
  HybridView,
  HybridViewMethods,
  HybridViewProps,
} from 'react-native-nitro-modules'

export type ColorScheme = 'light' | 'dark'

export interface TestViewProps extends HybridViewProps {
  isBlue: boolean
  hasBeenCalled: boolean
  colorScheme: ColorScheme
  someCallback: () => void
  optionalLabel?: string
  optionalCallback?: () => void
}
export interface TestViewMethods extends HybridViewMethods {
  someMethod(): void
  getIsBlueUpdateCount(): number
}

export type TestView = HybridView<TestViewProps, TestViewMethods>
