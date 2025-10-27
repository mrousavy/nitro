import type { HybridObject } from 'react-native-nitro-modules'

// This is a `HybridObject` with no generic type arguments (the platforms)
// by default it should be a Swift/Kotlin HybridObject.
export interface PlatformObject extends HybridObject {
  getOSVersion(): string
}
