import { getHostComponent, type HybridRef } from 'react-native-nitro-modules'
import MeasuredViewConfig from '../../nitrogen/generated/shared/json/MeasuredViewConfig.json'
import type {
  MeasuredViewMethods,
  MeasuredViewProps,
} from '../specs/MeasuredView.nitro'

export const MeasuredView = getHostComponent<
  MeasuredViewProps,
  MeasuredViewMethods
>('MeasuredView', () => MeasuredViewConfig)

export type MeasuredViewRef = HybridRef<MeasuredViewProps, MeasuredViewMethods>
