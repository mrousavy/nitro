import { type HybridObject } from 'react-native-nitro-modules'

type PixelFormat = 'rgb' | 'yuv-8bit' | 'yuv-10bit'
type ImageFormat = 'jpg' | 'png'

interface ImageSize {
  readonly width: number
  readonly height: number
}

export interface Image
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  readonly size: ImageSize
  readonly pixelFormat: PixelFormat

  someSettableProp: number

  toArrayBuffer(format: ImageFormat): number
  saveToFile(path: string, onFinished: (path: string) => void): void
}
