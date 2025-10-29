import type { SomeExternalObject } from 'react-native-nitro-test-external'

export interface SomeExternalObjectSubclass extends SomeExternalObject {
  readonly isSubclass: boolean
}
