import type { HybridObject } from 'react-native-nitro-modules'

export function logPrototypeChain(type: HybridObject): void {
  console.log(`Prototype chain of ${type.name}:`)
  let object = type
  let indentation = '  '
  while (object != null) {
    const keysCount = Object.keys(object).length
    if (object === type) {
      console.log(
        `${indentation}${object.__type ?? type.name} (${keysCount} props)`
      )
      indentation += ' '
    } else {
      console.log(
        `${indentation}∟ ${object.__type ?? '{}'} (${keysCount} props)`
      )
      indentation += '   '
    }
    object = Object.getPrototypeOf(object)
  }
}
