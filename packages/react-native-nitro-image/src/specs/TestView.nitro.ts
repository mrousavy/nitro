import type {
  HybridView,
  HybridViewMethods,
  HybridViewProps,
} from 'react-native-nitro-modules'

export type ColorScheme = 'light' | 'dark'

export interface TestViewProps extends HybridViewProps {
  isBlue: boolean
  colorScheme: ColorScheme
  someCallback: () => void
}
export interface TestViewMethods extends HybridViewMethods {
  someMethod(): void
}

export type TestView = HybridView<TestViewProps, TestViewMethods>
