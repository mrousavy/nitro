package com.margelo.nitro.core

import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip

interface ExtendableHybridClass {
    fun updateNative(hybridData: HybridData)
}

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
     * override val memorySize: ULong
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
     * This is `null`, until `updateNative(..)` is called.
     */
    private var mHybridData: HybridData? = null

    /**
     * Must be called in the constructor of a subclass of `HybridObject`, to initialize the C++
     * `JHybridObject` with a subclass of it.
     */
    override fun updateNative(hybridData: HybridData) {
        mHybridData = hybridData
    }
}
