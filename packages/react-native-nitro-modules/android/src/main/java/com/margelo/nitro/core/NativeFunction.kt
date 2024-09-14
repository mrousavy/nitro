package com.margelo.nitro.core

import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip

/**
 * Represents a callable function with one argument that is implemented in C++/JNI
 */
@Suppress("KotlinJniMissingFunction", "ConvertSecondaryConstructorToPrimary", "unused")
@Keep
@DoNotStrip
class NativeFunction<T> {
  @Keep
  @DoNotStrip
  private val mHybridData: HybridData

  @Keep
  @DoNotStrip
  private constructor(hybridData: HybridData) {
    mHybridData = hybridData
  }

  fun invoke(value: T) {
    invokeBoxed(value as Any)
  }

  private external fun invokeBoxed(value: Any)
}
