import { Platform } from 'react-native'

export function getNativeNitroModules(): never {
  throw new Error(
    `Native NitroModules are not available on ${Platform.OS}! Make sure you're not calling getNativeNitroModules() in a ${Platform.OS} (.${Platform.OS}.ts) environment.`
  )
}
