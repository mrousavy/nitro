package com.margelo.nitro.core

import androidx.annotation.CallSuper
import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip
import dalvik.annotation.optimization.FastNative

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
   * By default, this method only destroys the connected C++ part.
   * It can be overridden to perform actual disposing/cleanup if required.
   * This method must not throw.
   */
  @DoNotStrip
  @Keep
  @CallSuper
  open fun dispose() {
    synchronized(this) {
      cxxPartCache?.destroy()
      cxxPartCache = null
    }
  }

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
   * Override this method for each class in the inheritance
   * chain to connect it to a different C++ class.
   */
  protected open fun createCxxPart(): CxxPart {
    return CxxPart(this)
  }

  // Java owns the CxxPart. Native code must not retain a JNI global reference back to it,
  // otherwise HybridData's phantom-reference cleanup can never run.
  private var cxxPartCache: CxxPart? = null

  @Suppress("unused")
  @DoNotStrip
  @Keep
  private fun getCxxPart(): CxxPart {
    return synchronized(this) {
      cxxPartCache ?: createCxxPart().also {
        cxxPartCache = it
      }
    }
  }

  @Keep
  @DoNotStrip
  @Suppress("KotlinJniMissingFunction")
  protected open class CxxPart(
    @Keep
    @DoNotStrip
    val javaPart: HybridObject,
  ) {
    @DoNotStrip
    @Keep
    private var mHybridData: HybridData

    init {
      mHybridData = initHybrid()
    }

    fun destroy() {
      mHybridData.resetNative()
    }

    @FastNative
    protected open external fun initHybrid(): HybridData
  }
}
