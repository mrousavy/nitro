import { type HostComponent, type ViewProps } from 'react-native'

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
type NativeProps = ViewProps & {
  nativeProp: string
}

export const CustomView: HostComponent<NativeProps> =
  NativeComponentRegistry.get<NativeProps>('CustomView', () => viewConfig)
