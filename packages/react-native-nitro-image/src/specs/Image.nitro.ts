import { NitroModules, type HybridObject } from 'react-native-nitro-modules'

type PixelFormat = 'rgb' | 'yuv'

export interface Image extends HybridObject<{ ios: 'c++' }> {
  readonly width: number
  readonly height: number
  readonly data: ArrayBuffer
  readonly pixelFormat: PixelFormat

  constructor(): Image
  constructor(pixels: number[]): Image
}

export const ImageFactory = NitroModules.get<Image>()
