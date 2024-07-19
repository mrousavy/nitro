import { NitroModules, type HybridObject } from 'react-native-nitro-modules'

type PixelFormat = 'rgb' | 'yuv-8bit' | 'yuv-10bit'
type ImageFormat = 'jpg' | 'png'

export interface Image extends HybridObject<{ ios: 'c++' }> {
  readonly width: number
  readonly height: number
  readonly pixelFormat: PixelFormat

  toArrayBuffer(format: ImageFormat): ArrayBuffer
  saveToFile(path: string): Promise<void>
}

export const ImageFactory = NitroModules.get<Image>()
