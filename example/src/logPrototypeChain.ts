import type { HybridObject } from 'react-native-nitro-modules'

function dim(string: string): string {
  return `\x1b[2m${string}\x1b[0m`
}

export function logPrototypeChain(type: HybridObject): void {
  console.log(`Prototype chain of ${type.name}:`)
  let object = type
  let indentation = '  '
  while (object != null) {
    const keysCount = Object.keys(object).length
    if (object === type) {
      console.log(
        `${indentation}${object.__type ?? type.name} ${dim(`(${keysCount} props)`)}`
      )
      indentation += ' '
    } else {
      console.log(
        `${indentation}∟ ${object.__type ?? '{}'} ${dim(`(${keysCount} props)`)}`
      )
      indentation += '   '
    }
    object = Object.getPrototypeOf(object)
  }
}
