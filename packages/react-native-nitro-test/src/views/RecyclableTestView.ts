import { type HybridRef } from 'react-native-nitro-modules'
import {
  type RecyclableTestViewMethods,
  type RecyclableTestViewProps,
} from '../specs/RecyclableTestView.nitro'
import { getNitroTestHostComponent } from '../../nitrogen/generated/shared/ts/getNitroTestHostComponent'

/**
 * Represents the HybridView `TestView`, which can be rendered as a React Native view.
 */
export const RecyclableTestView = getNitroTestHostComponent<
  RecyclableTestViewProps,
  RecyclableTestViewMethods
>('RecyclableTestView')

export type RecyclableTestViewRef = HybridRef<
  RecyclableTestViewProps,
  RecyclableTestViewMethods
>
