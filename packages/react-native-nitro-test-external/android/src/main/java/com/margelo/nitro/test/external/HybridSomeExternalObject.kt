package com.margelo.nitro.test.external

class HybridSomeExternalObject : HybridSomeExternalObjectSpec() {
  override fun getValue(): String {
    return "Hello world!"
  }
  
  override fun getNumber(): SomeExternalObjectNumber {
    return SomeExternalObjectNumber(number = null)
  }
}
