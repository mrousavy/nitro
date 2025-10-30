import type { SomeExternalObject } from 'react-native-nitro-test-external'

// a HybridObject that inherits from an external/imported HybridObject
export interface SomeExternalObjectSubclass extends SomeExternalObject {
  getSubclassedValue(): string
}
