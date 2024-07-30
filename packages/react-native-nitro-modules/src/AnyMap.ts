/**
 * Represents a single value inside an untyped map.
 */
export type ValueType =
  | string
  | number
  | boolean
  | bigint
  | ValueType[]
  | { [k: string]: ValueType }

/**
 * Represents an untyped map, similar to a JSON structure.
 * Supported types:
 * - Primitives (`string`, `number`, `boolean`, `bigint`)
 * - Arrays of primitives (`ValueType[]`)
 * - Objects of primitives (`Record<string, ValueType>`)
 * - Arrays of arrays or objects
 * - Objects of arrays or objects
 */
export type AnyMap = Record<string, ValueType>
