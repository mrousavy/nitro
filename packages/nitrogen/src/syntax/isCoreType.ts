import { Type as TSMorphType } from 'ts-morph'

function isSymbol(type: TSMorphType, symbolName: string): boolean {
  // check the symbol directly
  const symbol = type.getSymbol()
  if (symbol?.getName() === symbolName) {
    return true
  }

  // loop through the alias symbol alias chain to test each one
  let aliasSymbol = type.getAliasSymbol()
  while (aliasSymbol != null) {
    if (aliasSymbol.getName() === symbolName) {
      return true
    }
    aliasSymbol = aliasSymbol.getAliasedSymbol()
  }

  // nothing found.
  return false
}

export function isPromise(type: TSMorphType): boolean {
  return isSymbol(type, 'Promise')
}

export function isRecord(type: TSMorphType): boolean {
  return isSymbol(type, 'Record')
}

export function isArrayBuffer(type: TSMorphType): boolean {
  return isSymbol(type, 'ArrayBuffer')
}

/**
 * List of TypedArray type names in JavaScript/TypeScript.
 */
export const TYPED_ARRAY_NAMES = [
  'Int8Array',
  'Uint8Array',
  'Int16Array',
  'Uint16Array',
  'Int32Array',
  'Uint32Array',
  'Float32Array',
  'Float64Array',
  'BigInt64Array',
  'BigUint64Array',
] as const

export type TypedArrayName = (typeof TYPED_ARRAY_NAMES)[number]

export function isTypedArray(type: TSMorphType): boolean {
  const symbol = type.getSymbol()
  if (symbol != null) {
    const name = symbol.getName()
    return TYPED_ARRAY_NAMES.includes(name as TypedArrayName)
  }
  return false
}

export function getTypedArrayName(type: TSMorphType): TypedArrayName | null {
  const symbol = type.getSymbol()
  if (symbol != null) {
    const name = symbol.getName()
    if (TYPED_ARRAY_NAMES.includes(name as TypedArrayName)) {
      return name as TypedArrayName
    }
  }
  return null
}

export function isDate(type: TSMorphType): boolean {
  return isSymbol(type, 'Date')
}

export function isMap(type: TSMorphType): boolean {
  return isSymbol(type, 'AnyMap')
}

export function isError(type: TSMorphType): boolean {
  return isSymbol(type, 'Error')
}

export function isCustomType(type: TSMorphType): boolean {
  return (
    type.getProperty('__customTypeName') != null &&
    type.getProperty('__customTypeConfig') != null
  )
}

export function isSyncFunction(type: TSMorphType): boolean {
  if (type.getCallSignatures().length < 1)
    // not a function.
    return false
  const syncTag = type.getProperty('__syncTag')
  return syncTag != null
}
