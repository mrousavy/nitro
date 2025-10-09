import type { Symbol } from 'ts-morph'

export class PropName {
  readonly name: string
  readonly isSymbol: boolean

  /**
   * Create a new {@linkcode PropName} from the given plain string property name.
   * @param plainStringName A plain string property name.
   */
  constructor(plainStringName: string)
  /**
   * Create a new {@linkcode PropName} from the given well-known Symbol name.
   * The Symbol's value will then be used as a property name.
   * @param wellKnownSymbolName The well-known Symbol's property name. For example: `"dispose"` (for {@linkcode Symbol.dispose})
   * @param isSymbol Has to be set to `true` to make this a `Symbol`.
   */
  constructor(wellKnownSymbolName: string, isSymbol: true)
  constructor(name: string, isSymbol = false) {
    this.name = name
    this.isSymbol = isSymbol
  }

  toString(): string {
    return this.name
  }

  /**
   * Converts this {@linkcode PropName} to a JS key.
   * If this is a plain simple string key, it will just return as-is.
   * For complex keys (e.g. `Symbol`), this will return the key accessor syntax (`[Symbol.X]`).
   */
  toJSKey(): string {
    if (this.isSymbol) {
      return `[Symbol.${this.name}]`
    } else {
      return this.name
    }
  }

  /**
   * Returns the syntax to create a C++ PropName from this JS PropName.
   */
  toCppPropName(): string {
    if (this.isSymbol) {
      return `PropName::symbol("${this.name}")`
    } else {
      return `PropName::string("${this.name}")`
    }
  }
}

export function symbolToPropName(symbol: Symbol): PropName {
  const type = symbol.getDeclaredType()
  return new PropName(symbol.getName())
}
