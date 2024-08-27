package com.margelo.nitro.core

import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import kotlin.concurrent.thread

/**
 * Represents an untyped map of string keys with associated values.
 * This is like an "`any`" JS object.
 */
@Suppress("KotlinJniMissingFunction")
@Keep
@DoNotStrip
class AnyMap {
  private val mHybridData: HybridData

  init {
    mHybridData = initHybrid()
  }

  private external fun initHybrid(): HybridData
}
