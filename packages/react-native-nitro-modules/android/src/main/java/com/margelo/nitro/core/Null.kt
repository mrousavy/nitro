package com.margelo.nitro.core

import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip

@DoNotStrip
@Keep
@JvmInline
value class NullType private constructor(
  private val token: Byte,
) {
  companion object {
    @DoNotStrip
    @Keep
    @JvmField
    val NULL = NullType(0)
  }
}
