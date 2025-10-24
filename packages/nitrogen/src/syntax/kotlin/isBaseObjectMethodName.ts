import type { Method } from '../Method.js'

const kotlinAnyMethodNames = ['equals', 'hashCode', 'toString']

/**
 * Returns `true` if the given {@linkcode method} is a
 * method that exists in the base `Object` type in Java.
 * If this is true, it needs an `override` modifier.
 */
export function isBaseObjectMethodName(method: Method): boolean {
  return kotlinAnyMethodNames.includes(method.name)
}
