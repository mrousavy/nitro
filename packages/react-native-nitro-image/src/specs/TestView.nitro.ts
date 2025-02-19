import type {
  HybridView,
  HybridViewMethods,
  HybridViewProps,
} from 'react-native-nitro-modules'

export interface TestViewProps extends HybridViewProps {
  isBlue: boolean
  someCallback: () => void
}
export interface TestViewMethods extends HybridViewMethods {
  someMethod(): void
}

export type TestView = HybridView<TestViewProps, TestViewMethods>
