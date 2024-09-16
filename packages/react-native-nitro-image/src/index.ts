import { NitroModules } from 'react-native-nitro-modules'
import type { ImageFactory } from './specs/ImageFactory.nitro'
import {
  type TestObjectCpp,
  type TestObjectSwiftKotlin,
} from './specs/TestObject.nitro'

export * from './specs/TestObject.nitro'
export * from './specs/Image.nitro'
export * from './specs/ImageFactory.nitro'

/**
 * Constructors for creating instances of `Image`.
 */
export const ImageConstructors =
  NitroModules.createHybridObject<ImageFactory>('ImageFactory')

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
