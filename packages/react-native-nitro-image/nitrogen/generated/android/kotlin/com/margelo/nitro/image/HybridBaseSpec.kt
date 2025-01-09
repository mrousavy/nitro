///
/// HybridBaseSpec.kt
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

package com.margelo.nitro.image

import android.util.Log
import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.core.*

/**
 * A Kotlin class representing the Base HybridObject.
 * Implement this abstract class to create Kotlin-based instances of Base.
 */
@DoNotStrip
@Keep
@Suppress("RedundantSuppression", "KotlinJniMissingFunction", "PropertyName", "RedundantUnitReturnType", "unused")
abstract class HybridBaseSpec: HybridObject {
  @DoNotStrip
  private var mHybridData: HybridData

  public constructor() {
    mHybridData = initHybrid()
    super(mHybridData)
  }
  protected constructor(hybridData: HybridData): super(hybridData) {
    mHybridData = hybridData
  }

  // Properties
  @get:DoNotStrip
  @get:Keep
  abstract val baseValue: Double

  // Methods
  

  private external fun initHybrid(): HybridData

  companion object {
    private const val TAG = "HybridBaseSpec"
    init {
      try {
        Log.i(TAG, "Loading NitroImage C++ library...")
        System.loadLibrary("NitroImage")
        Log.i(TAG, "Successfully loaded NitroImage C++ library!")
      } catch (e: Error) {
        Log.e(TAG, "Failed to load NitroImage C++ library! Is it properly installed and linked? " +
                    "Is the name correct? (see `CMakeLists.txt`, at `add_library(...)`)", e)
        throw e
      }
    }
  }
}
