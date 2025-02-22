///
/// Func_std__shared_ptr_Promise_std__shared_ptr_margelo__nitro__image__HybridChildSpec___.kt
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
 * Represents the JavaScript callback `() => std::shared_ptr<Promise<std::shared_ptr<margelo::nitro::image::HybridChildSpec>>>`.
 * This can be either implemented in C++ (in which case it might be a callback coming from JS),
 * or in Kotlin/Java (in which case it is a native callback).
 */
@DoNotStrip
@Keep
@Suppress("ClassName", "RedundantUnitReturnType")
fun interface Func_std__shared_ptr_Promise_std__shared_ptr_margelo__nitro__image__HybridChildSpec___: () -> Promise<HybridChildSpec> {
  /**
   * Call the given JS callback.
   * @throws Throwable if the JS function itself throws an error, or if the JS function/runtime has already been deleted.
   */
  @DoNotStrip
  @Keep
  override fun invoke(): Promise<HybridChildSpec>
}

/**
 * Represents the JavaScript callback `() => std::shared_ptr<Promise<std::shared_ptr<margelo::nitro::image::HybridChildSpec>>>`.
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
class Func_std__shared_ptr_Promise_std__shared_ptr_margelo__nitro__image__HybridChildSpec____cxx: Func_std__shared_ptr_Promise_std__shared_ptr_margelo__nitro__image__HybridChildSpec___ {
  @DoNotStrip
  @Keep
  private val mHybridData: HybridData

  @DoNotStrip
  @Keep
  private constructor(hybridData: HybridData) {
    mHybridData = hybridData
  }

  @FastNative
  external override fun invoke(): Promise<HybridChildSpec>
}

/**
 * Represents the JavaScript callback `() => std::shared_ptr<Promise<std::shared_ptr<margelo::nitro::image::HybridChildSpec>>>`.
 * This is implemented in Java/Kotlin, via a `() -> Promise<HybridChildSpec>`.
 * The callback is always coming from native.
 */
@DoNotStrip
@Keep
@Suppress("ClassName", "RedundantUnitReturnType", "unused")
class Func_std__shared_ptr_Promise_std__shared_ptr_margelo__nitro__image__HybridChildSpec____java(private val function: () -> Promise<HybridChildSpec>): Func_std__shared_ptr_Promise_std__shared_ptr_margelo__nitro__image__HybridChildSpec___ {
  @DoNotStrip
  @Keep
  override fun invoke(): Promise<HybridChildSpec> {
    return this.function()
  }
}
