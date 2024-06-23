import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import type { UnsafeObject } from 'react-native/Libraries/Types/CodegenTypes';

export interface Spec extends TurboModule {
  install(): void;
  createTestHybridObject(): UnsafeObject;
  createSwiftTestHybridObject(): UnsafeObject;
}

export const NitroModules =
  TurboModuleRegistry.getEnforcing<Spec>('NitroModulesCxx');
NitroModules.install();
