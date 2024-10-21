import type { ts, Type } from 'ts-morph'

export function isSyncCallback(type: Type<ts.Type>): boolean {
  const symbol = type.getAliasSymbol()
  if (symbol == null) {
    return false
  }
  return symbol.getName() === 'SyncCallback'
}
