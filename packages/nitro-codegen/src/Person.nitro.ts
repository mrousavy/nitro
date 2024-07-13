import type { HybridObject } from 'react-native-nitro-modules'

interface Car {
  make: string
  model: string
  price: number
}

export interface Person extends HybridObject<{ ios: 'c++' }> {
  readonly name: string
  readonly age: number
  isHappy: boolean
  sayHi(name: string): void

  readonly car: Car
}
