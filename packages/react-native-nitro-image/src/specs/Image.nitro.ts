import { NitroModules, type HybridObject } from 'react-native-nitro-modules'

type PixelFormat = 'rgb' | 'yuv-8bit' | 'yuv-10bit'
type ImageFormat = 'jpg' | 'png'

interface ImageSize {
  readonly width: number
  readonly height: number
}

export interface Image extends HybridObject<{ ios: 'swift' }> {
  readonly size: ImageSize
  readonly pixelFormat: PixelFormat

  someSettableProp: number

  toArrayBuffer(format: ImageFormat): void
  saveToFile(path: string): void
}

export const ImageFactory = NitroModules.get<Image>()
