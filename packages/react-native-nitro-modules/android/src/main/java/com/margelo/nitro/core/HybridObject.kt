package com.margelo.nitro.core

import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip

/**
 * A base class for all Kotlin-based HybridObjects.
 */
@Keep
@DoNotStrip
open class HybridObject: ExtendableHybridClass {
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

    protected open var mHybridData: HybridData

    protected constructor(hybridData: HybridData) {
        mHybridData = hybridData
    }

    override fun updateNative(hybridData: HybridData) {

    }
}
