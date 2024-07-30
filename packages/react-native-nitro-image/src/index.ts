import { NitroModules } from 'react-native-nitro-modules'
import type { ImageFactory } from './specs/ImageFactory.nitro'
import type { TestObject } from './specs/TestObject.nitro'

export * from './specs/Image.nitro'
export * from './specs/ImageFactory.nitro'

/**
 * Constructors for creating instances of `Image`.
 */
export const ImageConstructors = NitroModules.get<ImageFactory>('ImageFactory')

/**
 * The Hybrid Test Object
 */
export const HybridTestObject = NitroModules.get<TestObject>('TestObject')
