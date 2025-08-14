import { NitroModules } from 'react-native-nitro-modules'
import type { SomeExternalObject } from './specs/SomeExternalObject.nitro'

export const HybridExternalObject =
  NitroModules.createHybridObject<SomeExternalObject>('SomeExternalObject')
