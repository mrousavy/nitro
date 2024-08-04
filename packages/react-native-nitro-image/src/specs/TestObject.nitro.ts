import { type HybridObject, type AnyMap } from 'react-native-nitro-modules'

type Float3 = [number, number, number]
type TestTuple = [number, string, boolean]

export interface TestObject extends HybridObject<{ ios: 'c++' }> {
  createMap(): AnyMap
  mapRoundtrip(map: AnyMap): AnyMap

  valueThatWillThrowOnAccess: number
  funcThatThrows(): number

  tryOptionalParams(num: number, boo: boolean, optionalString?: string): string

  passVariant(
    either: number | string | number[] | string[] | boolean
  ): number | string

  flip(vector: Float3): Float3
  passTuple(tuple: TestTuple): [number, string, boolean]

  getValueFromJsCallback(
    callback: () => string,
    andThenCall: (valueFromJs: string) => void
  ): Promise<void>
}
