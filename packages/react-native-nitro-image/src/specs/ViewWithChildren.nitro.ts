import type {
  HybridView,
  HybridViewMethods,
  HybridViewProps,
} from 'react-native-nitro-modules'

export type ColorScheme = 'light' | 'dark'

export interface ViewWithChildrenProps extends HybridViewProps {
  isBlue: boolean
  colorScheme: ColorScheme
  someCallback: () => void
}
export interface ViewWithChildrenMethods extends HybridViewMethods {
  someMethod(): void
}

export type ViewWithChildren = HybridView<
  ViewWithChildrenProps,
  ViewWithChildrenMethods,
  { ios: 'swift'; android: 'kotlin' },
  { allowChildren: true }
>
