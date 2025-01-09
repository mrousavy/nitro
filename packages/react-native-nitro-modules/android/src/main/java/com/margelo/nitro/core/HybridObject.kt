package com.margelo.nitro.core

import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip

/**
 * A base class for all Kotlin-based HybridObjects.
 */
@Keep
@DoNotStrip
abstract class HybridObject: ExtendableHybridClass {
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
     *     return imageSize
     *   }
     * ```
     */
    @get:DoNotStrip
    @get:Keep
    abstract val memorySize: Long

    /**
     * Holds the native C++ instance.
     * In `HybridObject`, the C++ instance is a sub-class of `JHybridObject`, such as one of it's specs.
     */
    private var mHybridData: HybridData

    /**
     * Initialize the `HybridObject` with it's C++ counterpart (the fbjni `jni::HybridClass`).
     * Since `HybridObject` itself is abstract, it's subclass needs to initialize the C++ part.
     */
    protected constructor(hybridData: HybridData) {
        mHybridData = hybridData
    }
}
