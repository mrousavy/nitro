package com.margelo.nitro.core

import com.facebook.jni.HybridData

/**
 * Represents an fbjni Hybrid Class (aka a Java class with an accompanying C++ class)
 * that supports inheritance.
 *
 * Each fbjni Hybrid Class initializes it's `mHybridData` using an `initHybrid()` method,
 * which initializes the respective C++ class this was bound to.

 * Assuming we have Java class `B` which extends Java class `A`, and a C++
 * inheritance chain that reflects the Java inheritance chain (C++ class `B` which extends C++ class `A`),
 * we would have two `initHybrid()` methods - one for `A` and one for `B`.
 * - When you initialize an instance of `A`, it will initialize `A`'s C++ part.
 * - When you initialize an instance of `B`, it will initialize `B`'s C++ part, as well as `A`'s C++ part, since
 *   the native `A.initHybrid()` method cannot be overridden in `B` - both have their own `initHybrid()` methods!
 *
 * To fix this issue, we have `ExtendableHybridClass`. In an extendable HybridClass, we initialize `mHybridData`,
 * but we pass it upwards the inheritance chain after initializing self using `updateNative(mHybridData)`.
 * This way the actual `mHybridData` instance is the lowest class in the chain - `B`.
 */
interface ExtendableHybridClass {
  /**
   * Update the `hybridData` (C++ part) this Hybrid Class is referencing.
   * Call this with `hybridData` from a subclass to properly fill in the inheritance chain.
   */
  fun updateNative(hybridData: HybridData)
}
