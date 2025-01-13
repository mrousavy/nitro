package com.margelo.nitro.core

import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip

/**
 * A base class for all Kotlin-based Hybrid Views.
 */
@Keep
@DoNotStrip
abstract class HybridView: HybridObject {
    /**
     * Get the `UIView` this HybridView is holding.
     *
     * This value should not change during the lifetime of this `HybridView`.
     */
    @get:DoNotStrip
    @get:Keep
    abstract val view: View

    /**
     * Holds the native C++ instance.
     * In `HybridView`, the C++ instance is a sub-class of `JHybridView`, such as one of it's specs.
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
