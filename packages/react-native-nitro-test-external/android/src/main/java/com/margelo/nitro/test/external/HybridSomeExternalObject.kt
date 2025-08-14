package com.margelo.nitro.test.external

class HybridSomeExternalObject: HybridSomeExternalObjectSpec() {
    override fun getValue(): String {
        return "Hello world!"
    }
}