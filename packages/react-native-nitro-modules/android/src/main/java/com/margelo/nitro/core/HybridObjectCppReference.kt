package com.margelo.nitro.core

import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip

@Suppress("KotlinJniMissingFunction")
@DoNotStrip
@Keep
class HybridObjectCppReference {
    private var mHybridData: HybridData

    init {
        mHybridData = initHybrid()
    }

    fun resetNative() {
        mHybridData.resetNative()
    }

    private external fun initHybrid(): HybridData
}