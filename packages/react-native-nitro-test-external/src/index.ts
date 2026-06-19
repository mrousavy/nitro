import { NitroModules } from 'react-native-nitro-modules'
import type { SomeExternalObject } from './specs/SomeExternalObject.nitro'

export const HybridSomeExternalObject =
  NitroModules.createHybridObject<SomeExternalObject>('SomeExternalObject')

export { type SomeExternalObject } from './specs/SomeExternalObject.nitro'
