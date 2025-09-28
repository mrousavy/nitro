import { getHostComponent, type HybridRef } from 'react-native-nitro-modules'
import ViewWithChildrenConfig from '../../nitrogen/generated/shared/json/ViewWithChildrenConfig.json'
import {
  type ViewWithChildrenMethods,
  type ViewWithChildrenProps,
} from '../specs/ViewWithChildren.nitro'

/**
 * Represents the HybridView `ViewWithChildren`, which can be rendered as a React Native view.
 */
export const ViewWithChildren = getHostComponent<
  ViewWithChildrenProps,
  ViewWithChildrenMethods
>('ViewWithChildren', () => ViewWithChildrenConfig)

export type ViewWithChildrenRef = HybridRef<
  ViewWithChildrenProps,
  ViewWithChildrenMethods
>
