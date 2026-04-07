import { type HybridRef } from 'react-native-nitro-modules'
import type {
  Base,
  BlaBla,
  SomeExternalObject,
} from './specs/SomeExternalObject.nitro'
import type { TestViewMethods, TestViewProps } from './specs/TestView.nitro'
import { createNitroTestExternalHybridObject } from '../nitrogen/generated/shared/ts/createNitroTestExternalHybridObject'
import { getNitroTestExternalHostComponent } from '../nitrogen/generated/shared/ts/getNitroTestExternalHostComponent'

export const HybridSomeExternalObject =
  createNitroTestExternalHybridObject<SomeExternalObject>('SomeExternalObject')

export const HybridBlaBla =
  createNitroTestExternalHybridObject<BlaBla>('BlaBla')

export const HybridBase = createNitroTestExternalHybridObject<Base>('Base')

export {
  type Base,
  type BlaBla,
  type SomeExternalObject,
} from './specs/SomeExternalObject.nitro'

/**
 * Represents the HybridView `TestView`, which can be rendered as a React Native view.
 */
export const TestView = getNitroTestExternalHostComponent<
  TestViewProps,
  TestViewMethods
>('TestView')

export type TestViewRef = HybridRef<TestViewProps, TestViewMethods>
