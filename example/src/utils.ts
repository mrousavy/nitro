import { NitroModules } from 'react-native-nitro-modules'

export function stringify(value: unknown): string {
  if (value == null) {
    return 'null'
  }

  switch (typeof value) {
    case 'string':
      return value
    case 'bigint':
    case 'boolean':
    case 'number':
    case 'symbol':
      return String(value)
    case 'function':
      return value.toString()
    case 'object':
      if (value instanceof Error) {
        return `${value.name}: ${value.message}`
      }
      try {
        if ('toString' in value) {
          if (Object.hasOwn(value, 'toString')) {
            // It is some kind of Object that has a toString() method directly.
            const string = value.toString()
            if (string !== '[object Object]') return string
          } else {
            // It is some kind of Object that has a toString() method somewhere in the prototype chain..
            // It is _likely_ that this method requires NativeState
            if (NitroModules.hasNativeState(value)) {
              // If we have NativeState, toString() will likely work.
              const string = value.toString()
              if (string !== '[object Object]') return string
            }
          }
        }
      } catch {
        // toString() threw - maybe because we accessed it on a prototype.
      }
      return `{ [Object] ${Object.keys(value).join(', ')} }`
    default:
      return `${value}`
  }
}
