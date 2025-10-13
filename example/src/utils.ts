import { NitroModules } from 'react-native-nitro-modules'

export function isNativeFunction(func: Function): boolean {
  // a pretty dumb check to see if a function is a native function (jsi::HostFunction).
  return func.toString().includes('[native code]')
}

export function findPrototypeWhere<T extends object>(
  obj: T,
  where: (obj: Partial<T>) => boolean
): Partial<T> | undefined {
  if (where(obj)) {
    return obj
  }
  const prototype = Object.getPrototypeOf(obj)
  if (prototype == null) {
    return undefined
  }
  return findPrototypeWhere(prototype, where)
}

const HybridObjectPrototype = findPrototypeWhere(
  NitroModules,
  (obj) =>
    Object.hasOwn(obj, 'toString') &&
    Object.hasOwn(obj, 'equals') &&
    Object.hasOwn(obj, 'dispose')
)
if (HybridObjectPrototype == null) {
  throw new Error(`Failed to find HybridObject root prototype!`)
}
function isHybridObjectSubclass(obj: object): boolean {
  if (!(obj.toString instanceof Function)) {
    // it doesn't haven have .toString
    return false
  }
  // If it's .toString function is the same as the HybridObject prototype's
  // .toString function, it means it is inheriting from HybridObject.
  return obj.toString === HybridObjectPrototype?.toString
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
          if (isHybridObjectSubclass(value)) {
            // It's a subclass from the HybridObject prototype chain.
            // Let's check if it even has a NativeState, only then it is safe to call .toString()...
            if (NitroModules.hasNativeState(value)) {
              // We have NativeState - we can call it!
              const string = value.toString()
              if (string !== '[object Object]') return string
            } else {
              // We don't have NativeState - we cannot safely call toString()..
              const keys = Object.keys(value)
              return `[empty-object HybridObject (${keys.join(', ')})]`
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
