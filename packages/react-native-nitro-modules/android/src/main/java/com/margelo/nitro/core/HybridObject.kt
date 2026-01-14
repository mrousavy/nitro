package com.margelo.nitro.core

import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip

/**
 * A base class for all Kotlin-based HybridObjects.
 */
@Keep
@DoNotStrip
abstract class HybridObject {
  /**
   * Get the memory size of the Kotlin instance (plus any external heap allocations),
   * in bytes.
   *
   * Override this to allow tracking heap allocations such as buffers or images,
   * which will help the JS GC be more efficient in deleting large unused objects.
   *
   * @example
   * ```kotlin
   * override val memorySize: ULong
   *   get() {
   *     val imageSize = this.bitmap.bytesPerRow * this.bitmap.height
   *     return imageSize
   *   }
   * ```
   */
  @get:DoNotStrip
  @get:Keep
  open val memorySize: Long
    get() = 0L

  /**
   * Eagerly- (and manually-) dispose all native resources this `HybridObject` holds.
   * This method can only be manually called from JS using `dispose()`.
   *
   * If this method is never manually called, a `HybridObject` is expected to disposes its
   * resources as usual via the object's destructor (`~HybridObject()`, `deinit` or `finalize()`).
   *
   * By default, this method does nothing. It can be overridden to perform actual disposing/cleanup
   * if required.
   * This method must not throw.
   */
  @DoNotStrip
  @Keep
  open fun dispose() { }

  /**
   * Get a string representation of this `HybridObject` - useful for logging or debugging.
   */
  @DoNotStrip
  @Keep
  override fun toString(): String {
    val ownName = this::class.simpleName
    return "[HybridObject $ownName]"
  }

  /**
   * Holds the native C++ instance.
   * In `HybridObject`, the C++ instance is a sub-class of `JHybridObject`, such as one of its specs.
   * This is `null`, until `updateNative(..)` is called.
   */
  private var mHybridData: HybridData? = null

  /**
   * If `HybridObject` is subclassed, the sub-class needs to create its own `HybridData`
   * with a C++ `jni::HybridClass` representing the subclass directly.
   * Then, that `HybridData` must be passed upwards to `HybridObject` using `updateNative(..)`.
   *
   * This must happen for each sub/base class in the whole inheritance chain to ensure
   * overrides and type-erasure works as expected.
   */
  protected open fun updateNative(hybridData: HybridData) {
    mHybridData = hybridData
  }
}
