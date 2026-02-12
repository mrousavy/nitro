import { getHostComponent, type HybridRef } from 'react-native-nitro-modules'
import {
  type TestViewMethods,
  type TestViewProps,
} from '../specs/TestView.nitro'

/**
 * Represents the HybridView `TestView`, which can be rendered as a React Native view.
 */
export const TestView = getHostComponent<TestViewProps, TestViewMethods>(
  'TestView'
)

export type TestViewRef = HybridRef<TestViewProps, TestViewMethods>
