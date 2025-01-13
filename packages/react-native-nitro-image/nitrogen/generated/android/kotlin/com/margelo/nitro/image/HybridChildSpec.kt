///
/// HybridChildSpec.kt
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
 * A Kotlin class representing the Child HybridObject.
 * Implement this abstract class to create Kotlin-based instances of Child.
 */
@DoNotStrip
@Keep
@Suppress(
  "KotlinJniMissingFunction", "unused",
  "RedundantSuppression", "RedundantUnitReturnType", "SimpleRedundantLet",
  "LocalVariableName", "PropertyName", "PrivatePropertyName", "FunctionName"
)
abstract class HybridChildSpec: HybridBaseSpec {
  /**
   * Default-initialize this `HybridChildSpec`.
   * Use this constructor if `HybridChildSpec` has no child-classes.
   */
  constructor(): super(initHybrid()) { }

  /**
   * Initialize this `HybridChildSpec` from a child-class
   * with a custom `HybridData` being passed upwards.
   * Use this constructor if `HybridChildSpec` is being initialized from a child-class.
   */
  protected constructor(hybridData: HybridData): super(hybridData) { }

  // Properties
  @get:DoNotStrip
  @get:Keep
  abstract val childValue: Double

  // Methods
  

  companion object {
    private const val TAG = "HybridChildSpec"
    @JvmStatic
    private external fun initHybrid(): HybridData

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
