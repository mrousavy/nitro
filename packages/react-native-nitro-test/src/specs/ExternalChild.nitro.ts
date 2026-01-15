import type { SomeExternalObject } from 'react-native-nitro-test-external'

export interface ExternalChild extends SomeExternalObject {
  bounceString(string: string): string
}
