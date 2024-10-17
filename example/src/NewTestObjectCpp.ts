import type { TestObjectCpp } from 'react-native-nitro-image'
import { getHybridObjectConstructor } from 'react-native-nitro-modules'

/**
 * Create a new instance of `TestObjectCpp`.
 * @example
 * ```ts
 * const testObject = new NewTestObjectCpp()
 * ```
 */
export const NewTestObjectCpp =
  getHybridObjectConstructor<TestObjectCpp>('TestObjectCpp')

// --------------------------------------------------------
// Some tests for the prototype stuff
// --------------------------------------------------------

console.log(Object.keys(NewTestObjectCpp.prototype))
console.log('Something false', {} instanceof NewTestObjectCpp)
const first = new NewTestObjectCpp()
console.log(Object.keys(NewTestObjectCpp.prototype))
console.log('Something true', first instanceof NewTestObjectCpp)
const second = new NewTestObjectCpp()
console.log('Something true', first instanceof NewTestObjectCpp)
console.log('Something true', second instanceof NewTestObjectCpp)

console.log(first.addStrings('he', 'llo'))
console.log(second.addStrings('he', 'llo'))
console.log('hopefully false', first === second)
console.log(
  'hopefully true',
  Object.getPrototypeOf(first) === Object.getPrototypeOf(second)
)
