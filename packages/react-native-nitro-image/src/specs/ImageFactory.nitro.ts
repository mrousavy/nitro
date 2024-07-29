import { NitroModules, type HybridObject } from 'react-native-nitro-modules'
import type { Image } from './Image.nitro'

interface ImageFactory
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  loadImageFromFile(path: string): Image
  loadImageFromURL(path: string): Image
  loadImageFromSystemName(path: string): Image
  bounceBack(image: Image): Image
}

export const ImageConstructors = NitroModules.get<ImageFactory>('ImageFactory')
