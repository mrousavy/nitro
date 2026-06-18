import type {
  HybridView,
  HybridViewMethods,
  HybridViewProps,
} from 'react-native-nitro-modules'

export interface RecyclableTestViewProps extends HybridViewProps {
  isBlue: boolean
}
export interface RecyclableTestViewMethods extends HybridViewMethods {}

export type RecyclableTestView = HybridView<
  RecyclableTestViewProps,
  RecyclableTestViewMethods
>
