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
          const string = value.toString()
          if (string !== '[object Object]') return string
        }
        return `{ ${value} ${Object.keys(value).join(', ')} }`
      } catch (e) {
        // toString() threw - maybe because we accessed it on a prototype.
        return `{ [Object] ${Object.keys(value).join(', ')} }`
      }
    default:
      return `${value}`
  }
}
