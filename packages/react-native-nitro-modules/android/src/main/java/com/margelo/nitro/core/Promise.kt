package com.margelo.nitro.core

import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip

@Keep
@DoNotStrip
class Promise {
  private val mHybridData: HybridData

  init {
    mHybridData = initHybrid()
  }

  private external fun initHybrid(): HybridData
}
