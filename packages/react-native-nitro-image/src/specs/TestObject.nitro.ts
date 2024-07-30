import { type HybridObject } from 'react-native-nitro-modules'

export interface TestObject extends HybridObject<{ ios: 'c++' }> {
  getMap(): string | number

  getValueFromJsCallback(
    callback: () => string,
    andThenCall: (valueFromJs: string) => void
  ): Promise<void>
}
