import { Platform } from 'react-native'

export const NitroModules = new Proxy(
  {},
  {
    get: () => {
      throw new Error(
        `Native NitroModules are not available on ${Platform.OS}! Make sure you're not calling getNativeNitroModules() in a ${Platform.OS} (.${Platform.OS}.ts) environment.`
      )
    },
  }
)

export function isRuntimeAlive(): boolean {
  return false
}
