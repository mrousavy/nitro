///
/// HybridImageSpec.kt
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

package com.margelo.nitro.image

import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.core.*

/**
 * A Kotlin class representing the Image HybridObject.
 * Implement this abstract class to create Kotlin-based instances of Image.
 */
@DoNotStrip
@Keep
@Suppress(
  "KotlinJniMissingFunction", "unused",
  "RedundantSuppression", "RedundantUnitReturnType", "SimpleRedundantLet",
  "LocalVariableName", "PropertyName", "PrivatePropertyName", "FunctionName"
)
abstract class HybridImageSpec: HybridObject() {
  @DoNotStrip
  private var mHybridData: HybridData = initHybrid()

  init {
    super.updateNative(mHybridData)
  }

  override fun updateNative(hybridData: HybridData) {
    mHybridData = hybridData
    super.updateNative(hybridData)
  }

  // Properties
  @get:DoNotStrip
  @get:Keep
  abstract val size: ImageSize
  
  @get:DoNotStrip
  @get:Keep
  abstract val pixelFormat: PixelFormat
  
  @get:DoNotStrip
  @get:Keep
  @set:DoNotStrip
  @set:Keep
  abstract var someSettableProp: Double

  // Methods
  @DoNotStrip
  @Keep
  abstract fun toArrayBuffer(format: ImageFormat): Double
  
  abstract fun saveToFile(path: String, onFinished: (path: String) -> Unit): Unit
  
  @DoNotStrip
  @Keep
  private fun saveToFile_cxx(path: String, onFinished: Func_void_std__string): Unit {
    val __result = saveToFile(path, onFinished)
    return __result
  }

  private external fun initHybrid(): HybridData

  companion object {
    private const val TAG = "HybridImageSpec"
  }
}
