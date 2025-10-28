import { NitroModules } from 'react-native-nitro-modules'
import {
  type TestObjectCpp,
  type TestObjectSwiftKotlin,
} from './specs/TestObject.nitro'
import { type PlatformObject } from './specs/PlatformObject.nitro'
import type { Base } from './specs/Base.nitro'
import type { Child } from './specs/Child.nitro'
import { TestView, type TestViewRef } from './views/TestView'

// Export all Hybrid Object types
export * from './specs/Base.nitro'
export * from './specs/Child.nitro'
export * from './specs/PlatformObject.nitro'
export * from './specs/TestObject.nitro'
export * from './specs/TestView.nitro'

// Export all HybridObject singleton instances
export const HybridTestObjectCpp =
  NitroModules.createHybridObject<TestObjectCpp>('TestObjectCpp')
export const HybridTestObjectSwiftKotlin =
  NitroModules.createHybridObject<TestObjectSwiftKotlin>(
    'TestObjectSwiftKotlin'
  )
export const HybridBase = NitroModules.createHybridObject<Base>('Base')
export const HybridChild = NitroModules.createHybridObject<Child>('Child')
export const HybridPlatformObject =
  NitroModules.createHybridObject<PlatformObject>('PlatformObject')

// Export View (+ it's ref type)
export { TestView, type TestViewRef }
