package com.margelo.nitro.image

import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.functions.Function1

class KotlinTestObject: HybridKotlinTestObjectSpec() {
    override var numberValue: Double = 0.0
    override var optionalNumber: Double? = null
    override var primitiveArray: DoubleArray = doubleArrayOf()
    override val memorySize: Long
        get() = 0

    // Methods
    @DoNotStrip
    fun getCallable(): com.margelo.nitro.functions.Function1<Int, Double> {
        return Function1 { (it * 2).toInt() }
    }
}