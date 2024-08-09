import type { HybridObject } from 'react-native-nitro-modules'

export function logPrototypeChain(type: HybridObject): void {
  let object = type
  let indentation = ''
  while (object != null) {
    if (indentation === '') console.log(object.__type)
    else console.log(`${indentation}∟ ${object.__type ?? '{}'}`)
    indentation += ' '
    object = Object.getPrototypeOf(object)
  }
}
