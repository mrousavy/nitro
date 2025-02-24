///
/// Func_void.kt
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

package com.margelo.nitro.image

import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.core.*
import dalvik.annotation.optimization.FastNative

/**
 * Represents the JavaScript callback `() => void`.
 * This can be either implemented in C++ (in which case it might be a callback coming from JS),
 * or in Kotlin/Java (in which case it is a native callback).
 */
@DoNotStrip
@Keep
@Suppress("ClassName", "RedundantUnitReturnType")
fun interface Func_void: () -> Unit {
  /**
   * Call the given JS callback.
   * @throws Throwable if the JS function itself throws an error, or if the JS function/runtime has already been deleted.
   */
  @DoNotStrip
  @Keep
  override fun invoke(): Unit
}

/**
 * Represents the JavaScript callback `() => void`.
 * This is implemented in C++, via a `std::function<...>`.
 * The callback might be coming from JS.
 */
@DoNotStrip
@Keep
@Suppress(
  "KotlinJniMissingFunction", "unused",
  "RedundantSuppression", "RedundantUnitReturnType",
  "ConvertSecondaryConstructorToPrimary", "ClassName", "LocalVariableName",
)
class Func_void_cxx: Func_void {
  @DoNotStrip
  @Keep
  private val mHybridData: HybridData

  @DoNotStrip
  @Keep
  private constructor(hybridData: HybridData) {
    mHybridData = hybridData
  }

  @DoNotStrip
  @Keep
  override fun invoke(): Unit {
    return invoke_cxx()
  }

  @FastNative
  private external fun invoke_cxx(): Unit
}

/**
 * Represents the JavaScript callback `() => void`.
 * This is implemented in Java/Kotlin, via a `() -> Unit`.
 * The callback is always coming from native.
 */
@DoNotStrip
@Keep
@Suppress("ClassName", "RedundantUnitReturnType", "unused")
class Func_void_java(private val function: () -> Unit): Func_void {
  @DoNotStrip
  @Keep
  override fun invoke(): Unit {
    return this.function()
  }
}
