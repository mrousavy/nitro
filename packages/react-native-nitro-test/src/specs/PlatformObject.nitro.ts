import type { HybridObject } from 'react-native-nitro-modules'

// This object is implemented in Swift and Kotlin
export interface PlatformObject extends HybridObject<{
  ios: 'swift'
  android: 'kotlin'
}> {
  getOSVersion(): string
  // Repro: can a HybridObject reach a React Native native module (here "BlobModule")?
  // Android can (via NitroModules.applicationContext); iOS has no equivalent.
  getReactContextInfo(): string
}
