import type { HybridView } from 'react-native-nitro-modules'

// Due to a limitation in react-native, functions cannot be passed to native views directly.
// Instead, a value of "true" is passed to the native view. To fix this, we wrap the function
// in an extra object.
export interface CallbackWrapper {
  callback: () => void
}

export interface TestView extends HybridView {
  isBlue: boolean
  someCallback: CallbackWrapper
}
