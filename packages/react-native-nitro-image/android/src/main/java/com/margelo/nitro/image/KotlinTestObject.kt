package com.margelo.nitro.image

import com.margelo.nitro.core.AnyMap
import com.margelo.nitro.core.ArrayBuffer
import com.margelo.nitro.core.Promise
import java.nio.ByteBuffer
import kotlin.concurrent.thread

class Func_void_string {
    operator fun invoke(value: String) {
        // Your implementation
    }
}

fun Func_void_string.toFunction(): (String) -> Unit = this::invoke

fun doSomething(callback: (String) -> Unit) {
    callback("55.0")
}

fun so () {
    val myFunc = Func_void_string()
    doSomething(myFunc.toFunction())  // Direct call, no extra object allocation
}

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

    fun onSomething(listen: (p: Person) -> Unit) {
        listen(Person("name", 25.5))
    }

    override fun addOnPersonBornListener(callback: Func_void_Person) {
        callback()
        onSomething(callback)

        callback.call(Person("Marc", 24.0))
        thread {
            Thread.sleep(500)
            callback.call(Person("Marc", 24.0))
        }
        thread {
            Thread.sleep(700)
            callback.call(Person("Marc", 24.0))
        }
        thread {
            Thread.sleep(1500)
            callback.call(Person("Marc", 24.0))
        }
    }
}