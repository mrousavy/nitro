import { Node, type PropertyName } from 'ts-morph'

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

/**
 * If the given ts-morph {@linkcode PropertyName} is a well-known Symbol property,
 * this returns the name of the well-known symbol.
 *
 * In all other cases (plain string keys, other type keys, ...), this returns `undefined`.
 *
 * @example
 * `[Symbol.dispose]` -> `"dispose"`
 * `"whatever"`       -> `undefined`
 */
function getWellKnownSymbolName(
  propertyName: PropertyName
): string | undefined {
  if (Node.isComputedPropertyName(propertyName)) {
    // It's a computed property (`[...]`) instead of a plain string property (`"..."`)
    const expression = propertyName.getExpression()
    if (Node.isPropertyAccessExpression(expression)) {
      // It's a property access - so `[X.Y]`. Let's see if `X` === `Symbol`...
      const leftHandSide = expression.getExpression().getText()
      if (leftHandSide === 'Symbol') {
        // It's an access on `[Symbol.Y]` - where `Y` is the well-known Symbol!
        const rightHandSide = expression.getName()
        return rightHandSide
      }
    }
  }
  return undefined
}

export function propertyNameToPropName(propertyName: PropertyName): PropName {
  const wellKnownSymbolName = getWellKnownSymbolName(propertyName)
  if (wellKnownSymbolName != null) {
    // It's a well known Symbol! e.g. `[Symbol.dispose]`.
    return new PropName(wellKnownSymbolName, true)
  }
  // It's a plain string key
  return new PropName(propertyName.getText())
}
