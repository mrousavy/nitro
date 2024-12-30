import type {
  HybridView,
  HybridViewMethods,
  HybridViewProps,
} from 'react-native-nitro-modules'

export interface TestViewProps extends HybridViewProps {
  someString: string
}

export interface TestViewMethods extends HybridViewMethods {
  doSomething(): void
}

export type TestView = HybridView<TestViewProps, TestViewMethods>
