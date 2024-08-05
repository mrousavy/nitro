import type { TurboModule } from 'react-native'

export interface Spec extends TurboModule {}

export function getNativeNitroModules(): Spec {
  throw new Error(
    `Native NitroModules are not available on web! Make sure you're not calling getNativeNitroModules() in a web (.web.ts) environment.`
  )
}
