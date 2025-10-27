import { NitroModules } from 'react-native-nitro-modules'
import {
  type Base,
  type Child,
  type TestObjectCpp,
  type TestObjectSwiftKotlin,
} from './specs/TestObject.nitro'
import { type PlatformObject } from './specs/PlatformObject.nitro'

export * from './specs/TestObject.nitro'

export * from './views/TestView'

/**
 * The Hybrid Test Object in C++
 */
export const HybridTestObjectCpp =
  NitroModules.createHybridObject<TestObjectCpp>('TestObjectCpp')

/**
 * The Hybrid Test Object in Swift/Kotlin
 */
export const HybridTestObjectSwiftKotlin =
  NitroModules.createHybridObject<TestObjectSwiftKotlin>(
    'TestObjectSwiftKotlin'
  )

export const HybridBase = NitroModules.createHybridObject<Base>('Base')
export const HybridChild = NitroModules.createHybridObject<Child>('Child')

export const HybridPlatformObject =
  NitroModules.createHybridObject<PlatformObject>('PlatformObject')
