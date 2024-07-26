package com.margelo.nitro

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
     * val memorySize: Int
     *   get() {
     *     val imageSize = this.bitmap.bytesPerRow * this.bitmap.height
     *     return getSizeOf(this) + imageSize
     *   }
     * ```
     */
    val memorySize: Int
}
