import type { HybridObject } from 'react-native-nitro-modules'

export interface Person extends HybridObject<{}>  {
  readonly name: string
  readonly age: number
  sayHi(name: string): void
}
