import { NitroModules } from 'react-native-nitro-modules'

export function isNativeFunction(func: Function): boolean {
  // a pretty dumb check to see if a function is a native function (jsi::HostFunction).
  return func.toString().includes('[native code]')
}

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
      if (Array.isArray(value)) {
        const items = value.map((v) => stringify(v))
        return `[${items.join(', ')}]`
      }
      try {
        if (value.toString instanceof Function) {
          if (isNativeFunction(value.toString)) {
            // It is a native jsi::HostFunction. Since we log Prototypes,
            // it is likely that we need a HybridObject (NativeState) to call it.
            if (NitroModules.hasNativeState(value)) {
              // We have NativeState - we can call it!
              const string = value.toString()
              if (string !== '[object Object]') return string
            } else {
              // We don't have NativeState - we cannot safely call toString()..
            }
          } else {
            const string = value.toString()
            if (string !== '[object Object]') return string
          }
        }
      } catch {
        // toString() threw - maybe because we accessed it on a prototype.
        console.warn(`Failed to stringify [${typeof value}]!`)
      }
      return `{ [Object] ${Object.keys(value).join(', ')} }`
    default:
      return `${value}`
  }
}
