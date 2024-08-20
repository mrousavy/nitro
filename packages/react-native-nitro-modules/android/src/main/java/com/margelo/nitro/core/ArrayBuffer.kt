package com.margelo.nitro.core

import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip
import java.nio.ByteBuffer

/**
 * An ArrayBuffer instance shared between native (Kotlin/C++) and JS.
 *
 * A `ByteBuffer` will be used as the underlying `ArrayBuffer`'s data,
 * which has to remain valid for as long as the `ArrayBuffer` is alive.
 */
@Suppress("KotlinJniMissingFunction")
@Keep
@DoNotStrip
class ArrayBuffer(val buffer: ByteBuffer) {
    /**
     * Holds the native C++ instance of the `ArrayBuffer`.
     */
    private val mHybridData: HybridData

    init {
        mHybridData = initHybrid(buffer)
    }

    private external fun initHybrid(buffer: ByteBuffer): HybridData
}
