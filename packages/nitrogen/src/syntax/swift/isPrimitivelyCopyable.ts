import type { Type } from '../types/Type.js'

/**
 * Returns `true` if the given {@linkcode type} is a datatype that
 * can be copied without running a copy constructor or special logic
 * to copy the data over. In other words; it's _primitively copyable_.
 */
export function isPrimitivelyCopyable(type: Type): boolean {
  switch (type.kind) {
    case 'number':
    case 'boolean':
    case 'bigint':
    case 'enum':
    case 'null':
    case 'void':
      return true
    default:
      return false
  }
}
