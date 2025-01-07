///
/// Variant_String_Double.kt
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

package com.margelo.nitro.image

import com.facebook.proguard.annotations.DoNotStrip

/**
 * Represents the TypeScript variant "String|Double".
 */
@DoNotStrip
sealed class Variant_String_Double {
  @DoNotStrip
  data class SomeString(@DoNotStrip val value: String): Variant_String_Double()
  @DoNotStrip
  data class SomeDouble(@DoNotStrip val value: Double): Variant_String_Double()

  inline fun <reified T> getAs(): T? = when (this) {
    is SomeString -> value as? T
    is SomeDouble -> value as? T
  }

  val isString: Boolean
    get() = this is SomeString
  val isDouble: Boolean
    get() = this is SomeDouble

  companion object {
    @JvmStatic
    @DoNotStrip
    fun create(value: String): Variant_String_Double = SomeString(value)
    @JvmStatic
    @DoNotStrip
    fun create(value: Double): Variant_String_Double = SomeDouble(value)
  }
}
