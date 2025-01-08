package com.margelo.nitro.views

import android.view.View
import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.core.HybridObject

/**
 * A base class for all Kotlin-based HybridViews.
 */
@Keep
@DoNotStrip
abstract class HybridView: HybridObject() {
    /**
     * Get the view that this HybridView holds.
     *
     * @example
     * ```kotlin
     * override val view: View = ImageView()
     * ```
     */
    @get:DoNotStrip
    @get:Keep
    abstract val view: View
}
