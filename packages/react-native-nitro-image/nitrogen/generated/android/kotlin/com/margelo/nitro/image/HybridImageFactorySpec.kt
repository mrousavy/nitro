///
/// HybridImageFactorySpec.kt
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
 * A Kotlin class representing the ImageFactory HybridObject.
 * Implement this abstract class to create Kotlin-based instances of ImageFactory.
 */
@DoNotStrip
@Keep
@Suppress(
  "KotlinJniMissingFunction", "unused",
  "RedundantSuppression", "RedundantUnitReturnType", "SimpleRedundantLet",
  "LocalVariableName", "PropertyName", "PrivatePropertyName", "FunctionName"
)
abstract class HybridImageFactorySpec: HybridObject() {
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
  

  // Methods
  @JvmName("loadImageFromFile")
  @DoNotStrip
  @Keep
  abstract fun loadImageFromFile(path: String): HybridImageSpec
  
  @JvmName("loadImageFromURL")
  @DoNotStrip
  @Keep
  abstract fun loadImageFromURL(path: String): HybridImageSpec
  
  @JvmName("loadImageFromSystemName")
  @DoNotStrip
  @Keep
  abstract fun loadImageFromSystemName(path: String): HybridImageSpec
  
  @JvmName("bounceBack")
  @DoNotStrip
  @Keep
  abstract fun bounceBack(image: HybridImageSpec): HybridImageSpec

  private external fun initHybrid(): HybridData

  companion object {
    private const val TAG = "HybridImageFactorySpec"
  }
}
