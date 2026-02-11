package com.margelo.nitro.test.external

class HybridSomeExternalObject : HybridSomeExternalObjectSpec() {
  override fun getValue(): String {
    return "Hello world!"
  }

  override fun createOptionalPrimitivesHolder(
    optionalNumber: Double?,
    optionalBoolean: Boolean?,
    optionalUInt64: ULong?,
    optionalInt64: Long?,
  ): OptionalPrimitivesHolder {
    return OptionalPrimitivesHolder(optionalNumber, optionalBoolean, optionalUInt64, optionalInt64)
  }
}
