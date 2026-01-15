package com.margelo.nitro.test

import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip

@Keep
@DoNotStrip
class HybridExternalChild : HybridExternalChildSpec() {
  override val baseValue: Double
    get() = 40.0

  override fun bounceString(string: String): String {
    return string
  }

  override fun toString(): String {
    return "HybridExternalChild custom toString() :)"
  }
}
