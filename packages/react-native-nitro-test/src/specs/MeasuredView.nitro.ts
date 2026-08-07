import type {
  HybridView,
  HybridViewMethods,
  HybridViewProps,
} from 'react-native-nitro-modules'

export interface MeasuredViewProps extends HybridViewProps {
  text: string
  fontSize: number
}

export interface MeasuredViewMethods extends HybridViewMethods {}

export type MeasuredView = HybridView<
  MeasuredViewProps,
  MeasuredViewMethods,
  { ios: 'swift'; android: 'kotlin' }
>
