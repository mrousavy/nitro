import type { HybridObject } from 'react-native-nitro-modules'

/**
 * This hybrid object is implemented in Swift and Kotlin.
 * It can be called from Swift/Kotlin, as well as C++ directly.
 */
export interface SomeExternalObject
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  getValue(): string
}
