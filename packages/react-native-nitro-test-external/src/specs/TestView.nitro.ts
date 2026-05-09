import type {
  HybridView,
  HybridViewMethods,
  HybridViewProps,
} from 'react-native-nitro-modules'

export type ColorScheme = 'light' | 'dark'

export interface TestViewProps extends HybridViewProps {
  isCyan: boolean
  hasBeenCalled: boolean
  testCallback: () => void
}
export interface TestViewMethods extends HybridViewMethods {
  testMethod(): void
}

export type TestView = HybridView<TestViewProps, TestViewMethods>
