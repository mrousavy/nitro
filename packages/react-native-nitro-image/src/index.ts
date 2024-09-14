import { NitroModules } from 'react-native-nitro-modules'
import type { ImageFactory } from './specs/ImageFactory.nitro'
import {
  type KotlinTestObject,
  type TestObject,
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
 * The Hybrid Test Object
 */
export const HybridTestObject =
  NitroModules.createHybridObject<TestObject>('TestObject')

export const HybridKotlinTestObject =
  NitroModules.createHybridObject<KotlinTestObject>('KotlinTestObject')

// export const HybridKotlinTestObject =
//   NitroModules.createHybridObject<SwiftKotlinTestObject>(
//     'SwiftKotlinTestObject'
//   )
