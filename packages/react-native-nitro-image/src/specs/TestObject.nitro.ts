import { type HybridObject } from 'react-native-nitro-modules'

export interface TestObject extends HybridObject<{ ios: 'c++' }> {
  getMap(): Record<string, number | boolean>

  getValueFromJsCallback(
    callback: () => string,
    andThenCall: (valueFromJs: string) => void
  ): Promise<void>
}
