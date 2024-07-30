import { type HybridObject, type AnyMap } from 'react-native-nitro-modules'

export interface TestObject extends HybridObject<{ ios: 'c++' }> {
  createMap(): AnyMap
  mapRoundtrip(map: AnyMap): AnyMap
  getVariant(): number | string

  getValueFromJsCallback(
    callback: () => string,
    andThenCall: (valueFromJs: string) => void
  ): Promise<void>
}
