import type { Type } from "../types/Type.js";
import { getReferencedTypes } from "../getReferencedTypes.js";

/**
 * Checks whether all given types (and their recursively referenced types)
 * can safely derive `Debug`, `Clone`, and `PartialEq` in Rust.
 *
 * Returns `false` if any type is or contains a `function` (`Box<dyn Fn(...)>`)
 * or `hybrid-object` (`Box<dyn Trait>`), since trait objects don't implement
 * these standard traits.
 */
export function canDeriveRustTraits(types: Type[]): boolean {
  const nonDerivableKinds = new Set(["function", "hybrid-object"]);
  for (const type of types) {
    const referenced = getReferencedTypes(type);
    for (const t of referenced) {
      if (nonDerivableKinds.has(t.kind)) {
        return false;
      }
    }
  }
  return true;
}
