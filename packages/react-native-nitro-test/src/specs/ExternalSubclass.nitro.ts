import type { SomeExternalObject } from 'react-native-nitro-test-external'

export interface ExternalSubclass extends SomeExternalObject {
  getSubclassValue(): string
}
