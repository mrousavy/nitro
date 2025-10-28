import type { HybridObject } from 'react-native-nitro-modules'

// This object is implemented in Swift and Kotlin
export interface PlatformObject
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  getOSVersion(): string
}
