import { type HybridObject, type AnyMap } from 'react-native-nitro-modules'

export interface TestObject extends HybridObject<{ ios: 'c++' }> {
  getMap(): AnyMap
  getVariant(): number | string

  getValueFromJsCallback(
    callback: () => string,
    andThenCall: (valueFromJs: string) => void
  ): Promise<void>
}
