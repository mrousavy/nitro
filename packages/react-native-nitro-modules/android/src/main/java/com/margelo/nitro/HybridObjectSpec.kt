package com.margelo.nitro

import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip

/**
 * A base protocol for all Kotlin-based Hybrid Objects.
 */
interface HybridObjectSpec {
    /**
     * Get the memory size of the Kotlin instance (plus any external heap allocations),
     * in bytes.
     *
     * Override this to allow tracking heap allocations such as buffers or images,
     * which will help the JS GC be more efficient in deleting large unused objects.
     *
     * @example
     * ```kotlin
     * val memorySize: ULong
     *   get() {
     *     val imageSize = this.bitmap.bytesPerRow * this.bitmap.height
     *     return getSizeOf(this) + imageSize
     *   }
     * ```
     */
    @DoNotStrip
    @Keep
    val memorySize: ULong

    /**
     * The C++-based state of the HybridObject.
     * This must be initialized in the Kotlin constructor via `initHybrid()`.
     */
    @DoNotStrip
    @Keep
    val mHybridData: HybridData

    /**
     * Initialize the C++ part of the HybridObject.
     * This must be called in the constructor, and the result must be assigned to `mHybridData`.
     */
    external fun initHybrid(): HybridData
}
