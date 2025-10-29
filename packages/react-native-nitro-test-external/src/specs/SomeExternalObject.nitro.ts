import type { HybridObject } from 'react-native-nitro-modules'

type SomeExternalEnum = 'first' | 'second'

interface SomeExternalStruct {
  value: number
  callback: () => void
}

/**
 * This hybrid object is implemented in Swift and Kotlin.
 * It can be called from Swift/Kotlin, as well as C++ directly.
 */
export interface SomeExternalObject
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  getValue(): string
  bounceEnum(value: SomeExternalEnum): SomeExternalEnum
  bounceStruct(value: SomeExternalStruct): SomeExternalStruct
}
