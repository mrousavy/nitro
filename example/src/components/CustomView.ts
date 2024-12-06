import { type HostComponent, type ViewProps } from 'react-native'
import { HybridTestObjectCpp } from 'react-native-nitro-image'

// This has no type exports :/
import * as NativeComponentRegistry from 'react-native/Libraries/NativeComponent/NativeComponentRegistry'

// TODO: types for this are not exported / only exist in flow
const viewConfig = {
  uiViewClassName: 'CustomView',
  bubblingEventTypes: {},
  directEventTypes: {},
  validAttributes: {
    nativeProp: true,
  },
}

// TODO: try passing a nitro object here and casting it on the native side!
type NativeProps = ViewProps & {
  nativeProp: typeof HybridTestObjectCpp
}

export const CustomView: HostComponent<NativeProps> =
  NativeComponentRegistry.get<NativeProps>('CustomView', () => viewConfig)
