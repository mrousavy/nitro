import {
  type TestObjectCpp,
  type TestObjectSwiftKotlin,
} from './specs/TestObject.nitro'
import { type PlatformObject } from './specs/PlatformObject.nitro'
import type { Base } from './specs/Base.nitro'
import type { Child } from './specs/Child.nitro'
import { createNitroTestHybridObject } from '../nitrogen/generated/shared/ts/createNitroTestHybridObject'

// Export all Hybrid Object types
export * from './specs/Base.nitro'
export * from './specs/Child.nitro'
export * from './specs/PlatformObject.nitro'
export * from './specs/TestObject.nitro'
export * from './specs/TestView.nitro'

// Export all HybridObject singleton instances
export const HybridTestObjectCpp =
  createNitroTestHybridObject<TestObjectCpp>('TestObjectCpp')
export const HybridTestObjectSwiftKotlin =
  createNitroTestHybridObject<TestObjectSwiftKotlin>('TestObjectSwiftKotlin')
export const HybridBase = createNitroTestHybridObject<Base>('Base')
export const HybridChild = createNitroTestHybridObject<Child>('Child')
export const HybridPlatformObject =
  createNitroTestHybridObject<PlatformObject>('PlatformObject')

// Export View (+ its ref type)
export { TestView, type TestViewRef } from './views/TestView'
export {
  RecyclableTestView,
  type RecyclableTestViewRef,
} from './views/RecyclableTestView'
