import type { TestObjectCpp } from 'react-native-nitro-image'
import { NitroModules } from 'react-native-nitro-modules'

/**
 * Create a new instance of `TestObjectCpp`.
 * @example
 * ```ts
 * const testObject = new NewTestObjectCpp()
 * ```
 */
export const NewTestObjectCpp = (() => {
  const instance =
    NitroModules.createHybridObject<TestObjectCpp>('TestObjectCpp')
  const prototype = Object.getPrototypeOf(instance)
  if (NewTestObjectCpp.prototype !== prototype) {
    NewTestObjectCpp.prototype = prototype
    NewTestObjectCpp.prototypeInitialized = true
  }
  return instance
}) as unknown as { new (): TestObjectCpp } & { prototypeInitialized?: boolean }

// Configure lazy prototype. If `instanceof` is called before a `NewTestObjectCpp`
// has been created, we just lazy-create a new `TestObjectCpp` instance to set the proto.
NewTestObjectCpp.prototypeInitialized = false
NewTestObjectCpp[Symbol.hasInstance] = (instance) => {
  if (!NewTestObjectCpp.prototypeInitialized) {
    // User didn't call `new NewTestObjectCpp()` yet, so we don't
    // know the prototype yet. Just create one temp object to find
    // out the prototype.
    const tempInstance = NitroModules.createHybridObject('TestObjectCpp')
    NewTestObjectCpp.prototype = Object.getPrototypeOf(tempInstance)
    NewTestObjectCpp.prototypeInitialized = true
  }
  // Loop through the prototype chain of the value
  // we're testing for to see if it is a direct instance
  // of `TestObjectCpp`, or a derivative of it.
  let proto = Object.getPrototypeOf(instance)
  while (proto != null) {
    if (proto === NewTestObjectCpp.prototype) {
      return true
    }
    proto = Object.getPrototypeOf(proto)
  }
  // No prototype overlap.
  return false
}

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
