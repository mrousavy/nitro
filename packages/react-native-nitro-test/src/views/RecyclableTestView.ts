import { getHostComponent, type HybridRef } from 'react-native-nitro-modules'
import {
  type RecyclableTestViewMethods,
  type RecyclableTestViewProps,
} from '../specs/RecyclableTestView.nitro'

/**
 * Represents the HybridView `TestView`, which can be rendered as a React Native view.
 */
export const RecyclableTestView = getHostComponent<
  RecyclableTestViewProps,
  RecyclableTestViewMethods
>('RecyclableTestView')

export type RecyclableTestViewRef = HybridRef<
  RecyclableTestViewProps,
  RecyclableTestViewMethods
>
