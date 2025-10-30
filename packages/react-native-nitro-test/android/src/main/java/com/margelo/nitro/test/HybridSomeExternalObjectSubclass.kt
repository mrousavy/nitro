package com.margelo.nitro.test

import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip

@Keep
@DoNotStrip
class HybridSomeExternalObjectSubclass : HybridSomeExternalObjectSubclassSpec() {
  override fun getValue(): String {
    return "overridden!"
  }

  override fun getSubclassedValue(): String {
    return "subclassed!"
  }
}
