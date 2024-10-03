import { TurboModuleRegistry, type TurboModule } from 'react-native'

export interface Spec extends TurboModule {
  init(): void
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeNitroOnLoad')
