package com.margelo.nitro.test

import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.test.external.HybridSomeExternalObjectSpec
import com.margelo.nitro.test.external.SomeExternalObjectNumber

class HybridSomeInternalObject : HybridSomeExternalObjectSpec() {
  override fun getValue(): String {
    return "This is overridden!"
  }
  
  override fun getNumber(): SomeExternalObjectNumber {
    return SomeExternalObjectNumber(number = 10.0)
  }
}
