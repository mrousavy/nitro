import { type TurboModule, TurboModuleRegistry } from 'react-native'

export interface Spec extends TurboModule {
  addNumbers(a: number, b: number): number
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  'ExampleTurboModule'
) as Spec | null
