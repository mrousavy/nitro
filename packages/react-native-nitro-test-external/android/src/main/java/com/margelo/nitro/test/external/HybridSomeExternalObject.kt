package com.margelo.nitro.test.external

class HybridSomeExternalObject : HybridSomeExternalObjectSpec() {
  override fun getValue(): String {
    return "Hello world!"
  }

  override fun bounceEnum(value: SomeExternalEnum): SomeExternalEnum {
    return value
  }

  override fun bounceStruct(value: SomeExternalStruct): SomeExternalStruct {
    return value
  }
}
