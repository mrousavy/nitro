package com.margelo.nitro.image

import com.margelo.nitro.core.AnyMap
import com.margelo.nitro.core.ArrayBuffer
import com.margelo.nitro.core.Promise
import java.nio.ByteBuffer
import kotlin.concurrent.thread


class KotlinTestObject: HybridKotlinTestObjectSpec() {
    override var numberValue: Double = 0.0
    override var optionalNumber: Double? = null
    override var primitiveArray: DoubleArray = doubleArrayOf()
    override var carCollection: Array<Car> = emptyArray()
    override var someBuffer: ArrayBuffer
    override var someString: String = ""

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

    override fun mapRoundtrip(map: AnyMap): AnyMap {
        return map
    }

    override fun createMap(): AnyMap {
        val map = AnyMap()
        map.setDouble("double", 55.0)
        map.setString("string", "String!")
        map.setBoolean("bool", true)
        map.setBigInt("bigint", 893256789)
        map.setAnyObject("object", mapOf("first" to 1, "second" to "string", "third" to mapOf("nested" to true)))
        map.setAnyArray("array", arrayOf(11, true, 33.5, "string", arrayOf("nested", true)))
        return map
    }

    override fun addOnPersonBornListener(callback: (p: Person) -> Unit) {
        callback(Person("Marc", 24.0))
        thread {
            Thread.sleep(500)
            callback(Person("Marc", 24.0))
        }
        thread {
            Thread.sleep(700)
            callback(Person("Marc", 24.0))
        }
        thread {
            Thread.sleep(1500)
            callback(Person("Marc", 24.0))
        }
    }

    override var someRecord: Map<String, String> = mapOf("something" to "else")
}
