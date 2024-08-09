import type { HybridObject } from 'react-native-nitro-modules'

export function logPrototypeChain(type: HybridObject): void {
  console.log(`Prototype chain of ${type.name}:`)
  let object = type
  let indentation = '  '
  while (object != null) {
    const prefix = object === type ? indentation : `${indentation}∟ `
    console.log(`${prefix}${object.__type ?? '{}'}`)
    indentation += '   '
    object = Object.getPrototypeOf(object)
  }
}
