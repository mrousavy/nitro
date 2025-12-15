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

export function isInt32(type: TSMorphType): boolean {
  if (!type.isNumber()) return false
  const int32Tag = type.getProperty('__int32Tag')
  return int32Tag != null
}
