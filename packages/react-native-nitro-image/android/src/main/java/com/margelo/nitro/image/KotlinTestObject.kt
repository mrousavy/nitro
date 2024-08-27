package com.margelo.nitro.image

import com.margelo.nitro.core.AnyMap
import com.margelo.nitro.core.ArrayBuffer
import com.margelo.nitro.core.Promise
import java.nio.ByteBuffer

class KotlinTestObject: HybridKotlinTestObjectSpec() {
    override var numberValue: Double = 0.0
    override var optionalNumber: Double? = null
    override var primitiveArray: DoubleArray = doubleArrayOf()
    override var carCollection: Array<Car> = emptyArray()
    override var someBuffer: ArrayBuffer

    override val memorySize: Long
        get() = 0

    init {
        someBuffer = ArrayBuffer(ByteBuffer.allocateDirect(1024 * 1024))
    }

    // Methods
    override fun asyncTest(): Promise<Unit> {
        return Promise.async {
            Thread.sleep(3000)
        }
    }

    override fun createMap(): AnyMap {
        val map = AnyMap()
        map.setDouble("double", 55.0)
        map.setString("string", "String!")
        map.setBoolean("bool", true)
        map.setBigInt("bigint", 893256789)
        return map
    }

    override fun addOnPersonBornListener(callback: Func_void_Person) {
        callback.call(Person("Marc", 24.0))
    }
}