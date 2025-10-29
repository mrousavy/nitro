package com.margelo.nitro.test

import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip

class HybridSomeExternalObjectSubclass : HybridSomeExternalObjectSubclassSpec() {
  override fun getValue(): String {
    return "subclass!"
  }

  override fun bounceEnum(value: SomeExternalEnum): SomeExternalEnum {
    return value
  }

  override fun bounceStruct(value: SomeExternalStruct): SomeExternalStruct {
    return value
  }

  override val isSubclass: Boolean
    get() = true
}
