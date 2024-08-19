package com.margelo.nitro.image

class KotlinTestObject: HybridKotlinTestObjectSpec() {
    override var numberValue: Double = 0.0
    override val memorySize: Long
        get() = 0
}