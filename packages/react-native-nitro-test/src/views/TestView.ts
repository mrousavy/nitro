import { type HybridRef } from 'react-native-nitro-modules'
import {
  type TestViewMethods,
  type TestViewProps,
} from '../specs/TestView.nitro'
import { getNitroTestHostComponent } from '../../nitrogen/generated/shared/ts/getNitroTestHostComponent'

/**
 * Represents the HybridView `TestView`, which can be rendered as a React Native view.
 */
export const TestView = getNitroTestHostComponent<
  TestViewProps,
  TestViewMethods
>('TestView')

export type TestViewRef = HybridRef<TestViewProps, TestViewMethods>
