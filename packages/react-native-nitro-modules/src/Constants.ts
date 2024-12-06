import type { HybridObject } from './HybridObject'

/**
 * Converts {@linkcode property} (accessed on {@linkcode hybridObject}) to
 * a constant on the HybridObject {@linkcode T}'s prototype.
 *
 * All future accesses to {@linkcode T}.{@linkcode property} will be cached on the JS side.
 *
 * @param hybridObject The HybridObject {@linkcode T} instance to access this property once.
 * @param property The name of the property to convert to a constant.
 * @example
 * ```ts
 * const math1 = NitroModules.createHybridObject<Math>('Math')
 * const math2 = NitroModules.createHybridObject<Math>('Math')
 * math1.pi // <-- accesses native code
 * math2.pi // <-- accesses native code
 * createConstant(math1, 'pi')
 * math1.pi // <-- is cached on JS level
 * math2.pi // <-- is cached on JS level
 * ```
 */
export function createConstant<T extends HybridObject>(
  hybridObject: T,
  property: keyof T
): void {
  let prototype = hybridObject
  do {
    if (Object.hasOwn(prototype, property)) {
      Object.defineProperty(prototype, property, {
        value: hybridObject[property],
        writable: false,
        enumerable: true,
        configurable: false,
      })
      return
    }
    prototype = Object.getPrototypeOf(prototype)
  } while (prototype != null)
  throw new Error(
    `Property "${String(property)}" does not exist on any of ${hybridObject.name}'s prototypes!`
  )
}
