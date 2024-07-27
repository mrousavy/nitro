package com.margelo.nitro

import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip

/**
 * A base interface for all Kotlin-based HybridObjects.
 */
interface HybridObject {
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
    @get:DoNotStrip
    @get:Keep
    val memorySize: ULong
}
