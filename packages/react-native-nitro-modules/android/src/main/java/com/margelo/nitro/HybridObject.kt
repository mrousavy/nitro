package com.margelo.nitro

import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip

@Suppress("KotlinJniMissingFunction")
abstract class HybridObject: HybridObjectSpec {
    @DoNotStrip
    @Keep
    private val mHybridData: HybridData

    init {
        mHybridData = initHybrid()
    }

    private external fun initHybrid(): HybridData
}