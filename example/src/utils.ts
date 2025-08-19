import { NitroModules } from 'react-native-nitro-modules'

export function isNativeFunction(func: Function): boolean {
  // a pretty dumb check to see if a function is a native function (jsi::HostFunction).
  return func.toString().includes('[native code]')
}

function isObjectSubclass(object: object): boolean {
  let prototype = Object.getPrototypeOf(object)
  if (prototype === Object) {
    // It's a plain JS object directly as there is only one thing in the prototype chain: `Object`.
    return false
  }
  do {
    prototype = Object.getPrototypeOf(prototype)
    if (prototype === Object) {
      // After looking further up in the prototype chain, it is now subclassing `Object` (but
      // not `Object` directly), so we are good now!
      return true
    }
  } while (prototype != null)
  // We looked all the way up in the prototype chain and it is not an `Object` at all! Weird...
  return false
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
      // Try to use .toString()
      try {
        if (value.toString instanceof Function) {
          if (isNativeFunction(value.toString) && isObjectSubclass(value)) {
            // It is a native jsi::HostFunction. Since we log Prototypes,
            // it is likely that we need a HybridObject (NativeState) to call it.
            if (NitroModules.hasNativeState(value)) {
              // We have NativeState - we can call it!
              const string = value.toString()
              if (string !== '[object Object]') return string
            } else {
              // We don't have NativeState - we cannot safely call toString()..
              return `[empty-object HybridObject]`
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
      try {
        return JSON.stringify(value, (_, v) => {
          if (typeof v === 'bigint') {
            return v.toLocaleString()
          } else if (typeof v === 'function') {
            return v.toString()
          } else {
            return v
          }
        })
      } catch {
        return `{ [Object] ${Object.keys(value).join(', ')} }`
      }
    default:
      return `${value}`
  }
}
