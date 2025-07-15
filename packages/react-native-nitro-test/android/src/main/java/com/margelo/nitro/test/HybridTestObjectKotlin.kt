package com.margelo.nitro.test

import android.hardware.HardwareBuffer
import android.util.Log
import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.core.AnyMap
import com.margelo.nitro.core.AnyValue
import com.margelo.nitro.core.ArrayBuffer
import com.margelo.nitro.core.Promise
import kotlinx.coroutines.delay
import java.time.Instant

@Keep
@DoNotStrip
class HybridTestObjectKotlin: HybridTestObjectSwiftKotlinSpec() {
    private val TAG = "HybridTestObjectKotlin"

    override var numberValue: Double = 0.0
    override var boolValue: Boolean = false
    override var stringValue: String = ""
    override var bigintValue: Long = 0L
    override var stringOrUndefined: String? = null
    override var stringOrNull: String? = null
    override var optionalString: String? = null
    override var optionalHybrid: HybridTestObjectSwiftKotlinSpec? = null
    override val thisObject: HybridTestObjectSwiftKotlinSpec
        get() = this
    override var someVariant: Variant_String_Double = Variant_String_Double.create(55.05)
    override var optionalArray: Array<String>? = null
    override var optionalEnum: Powertrain? = null
    override var optionalOldEnum: OldEnum? = null
    override var optionalCallback: ((value: Double) -> Unit)? = null

    override fun simpleFunc() {
        // do nothing
    }

    override fun addNumbers(a: Double, b: Double): Double {
        return a + b
    }

    override fun addStrings(a: String, b: String): String {
        return a + b
    }

    override fun multipleArguments(num: Double, str: String, boo: Boolean) {
        Log.i(TAG, "Arguments received! num: $num | str: $str | boo: $boo")
    }

    override fun bounceStrings(array: Array<String>): Array<String> {
        return array
    }

    override fun bounceNumbers(array: DoubleArray): DoubleArray {
        return array
    }

    override fun bounceStructs(array: Array<Person>): Array<Person> {
        return array
    }

    override fun bounceEnums(array: Array<Powertrain>): Array<Powertrain> {
        return array
    }

    override fun complexEnumCallback(array: Array<Powertrain>, callback: (array: Array<Powertrain>) -> Unit) {
        callback(array)
    }

    override fun currentDate(): java.time.Instant {
        return Instant.now()
    }

    override fun add1Hour(date: Instant): Instant {
        val oneHourInSeconds = 1L * 60 * 60
        return date.plusSeconds(oneHourInSeconds)
    }

    override fun createMap(): AnyMap {
        val map = AnyMap()
        map.setDouble("number", numberValue)
        map.setBoolean("bool", boolValue)
        map.setString("string", stringValue)
        map.setBigInt("bigint", bigintValue)
        map.setNull("null")
        val array = arrayOf(AnyValue(numberValue), AnyValue(boolValue), AnyValue(stringValue), AnyValue(bigintValue))
        map.setAnyArray("array", array)
        map.setAnyObject("object", mapOf(
            "number" to AnyValue(numberValue),
            "bool" to AnyValue(boolValue),
            "string" to AnyValue(stringValue),
            "bigint" to AnyValue(bigintValue),
            "null" to AnyValue(),
            "array" to AnyValue(arrayOf(AnyValue(numberValue), AnyValue(boolValue), AnyValue(stringValue), AnyValue(bigintValue), AnyValue(array)))
        ))
        return map
    }

    override fun getMapKeys(map: AnyMap): Array<String> {
        return map.getAllKeys()
    }

    override fun mapRoundtrip(map: AnyMap): AnyMap {
        return map
    }

    override fun funcThatThrows(): Double {
        throw Error("This function will only work after sacrificing seven lambs!")
    }

    override fun funcThatThrowsBeforePromise(): Promise<Unit> {
        throw Error("This function will only work after sacrificing eight lambs!")
    }

    override fun throwError(error: Throwable): Unit {
        throw error
    }

    override fun tryOptionalParams(num: Double, boo: Boolean, str: String?): String {
        return str ?: "value omitted!"
    }

    override fun tryMiddleParam(num: Double, boo: Boolean?, str: String): String {
        return str
    }


    override fun tryOptionalEnum(value: Powertrain?): Powertrain? {
        return value
    }

    override fun bounceMap(map: Map<String, Variant_Double_Boolean>): Map<String, Variant_Double_Boolean> {
        return map
    }

    override fun extractMap(mapWrapper: MapWrapper): Map<String, String> {
        return mapWrapper.map
    }

    override fun calculateFibonacciSync(value: Double): Long {
        val n = value.toInt()
        if (n == 0) return 0L
        if (n == 1) return 1L

        var a = 0L
        var b = 1L
        for (i in 2..n) {
            val next = a + b
            a = b
            b = next
        }
        return b
    }

    override fun calculateFibonacciAsync(value: Double): Promise<Long> {
        return Promise.parallel { calculateFibonacciSync(value) }
    }

    override fun wait(seconds: Double): Promise<Unit> {
        return Promise.async { delay(seconds.toLong() * 1000) }
    }

    override fun promiseThrows(): Promise<Unit> {
        return Promise.async {
            throw Error("Promise throws :)")
        }
    }

    override fun awaitAndGetPromise(promise: Promise<Double>): Promise<Double> {
        return Promise.async {
            val result = promise.await()
            return@async result
        }
    }

    override fun awaitAndGetComplexPromise(promise: Promise<Car>): Promise<Car> {
        return Promise.async {
            val result = promise.await()
            return@async result
        }
    }

    override fun awaitPromise(promise: Promise<Unit>): Promise<Unit> {
        return Promise.async {
            promise.await()
        }
    }

    override fun callCallback(callback: () -> Unit) {
        callback()
    }

    override fun callWithOptional(value: Double?, callback: (maybe: Double?) -> Unit): Unit {
        callback(value)
    }

    override fun getValueFromJSCallbackAndWait(getValue: (() -> Promise<Double>)): Promise<Double> {
        return Promise.async {
            val jsResult = getValue().await()
            return@async jsResult
        }
    }

    override fun getValueFromJsCallback(callback: (() -> Promise<String>), andThenCall: ((valueFromJs: String) -> Unit)): Promise<Unit> {
        return Promise.async {
            val jsResult = callback().await()
            andThenCall(jsResult)
        }
    }

    override fun callAll(first: () -> Unit, second: () -> Unit, third: () -> Unit) {
        first()
        second()
        third()
    }

    override fun callSumUpNTimes(callback: () -> Promise<Double>, n: Double): Promise<Double> {
        var result = 0.0
        return Promise.async {
            for (i in 1..n.toInt()) {
                val current = callback().await()
                result += current
            }
            return@async result
        }
    }

  override fun callbackAsyncPromise(callback: () -> Promise<Promise<Double>>): Promise<Double> {
    return Promise.async {
      val promise = callback().await()
      val result = promise.await()
      return@async result
    }
  }

  override fun callbackAsyncPromiseBuffer(callback: () -> Promise<Promise<ArrayBuffer>>): Promise<ArrayBuffer> {
    return Promise.async {
      val promise = callback().await()
      val result = promise.await()
      return@async result
    }
  }

  override fun getComplexCallback(): (Double) -> Unit {
    return { value ->
        Log.i(TAG, "Callback called with $value.")
    }
  }

    override fun getCar(): Car {
        return Car(2018.0, "Lamborghini", "Huracán", 640.0, Powertrain.GAS, null, true)
    }

    override fun isCarElectric(car: Car): Boolean {
        return car.powertrain == Powertrain.ELECTRIC
    }

    override fun getDriver(car: Car): Person? {
        return car.driver
    }

    override fun jsStyleObjectAsParameters(params: JsStyleStruct): Unit {
        params.onChanged(params.value)
    }

    override fun createArrayBufferFromNativeBuffer(copy: Boolean): ArrayBuffer {
        val hardwareBuffer = HardwareBuffer.create(
            1024,
            1024,
            HardwareBuffer.RGBA_8888,
            1,
            HardwareBuffer.USAGE_CPU_WRITE_OFTEN or HardwareBuffer.USAGE_CPU_READ_OFTEN
        )
        if (copy) {
            return ArrayBuffer.copy(hardwareBuffer)
        } else {
            return ArrayBuffer.wrap(hardwareBuffer)
        }
    }

    override fun createArrayBuffer(): ArrayBuffer {
        return ArrayBuffer.allocate(1024 * 1024 * 10) // 10 MB
    }

    override fun createArrayBufferAsync(): Promise<ArrayBuffer> {
        return Promise.async { createArrayBuffer() }
    }

    override fun passVariant(either: Variant_String_Double_Boolean_DoubleArray_Array_String_): Variant_String_Double {
        either.getAs<String>()?.let {
            return Variant_String_Double.create(it)
        }
        either.getAs<Double>()?.let {
            return Variant_String_Double.create(it)
        }
        return Variant_String_Double.create("holds something else!")
    }

    override fun getVariantEnum(variant: Variant_Boolean_OldEnum): Variant_Boolean_OldEnum {
        return variant
    }

    override fun getVariantObjects(variant: Variant_Car_Person): Variant_Car_Person {
        return variant
    }

    override fun passNamedVariant(variant: NamedVariant): NamedVariant {
        return variant
    }

    override fun getVariantHybrid(variant: Variant_Person_HybridTestObjectSwiftKotlinSpec): Variant_Person_HybridTestObjectSwiftKotlinSpec {
        return variant
    }

    override fun getBufferLastItem(buffer: ArrayBuffer): Double {
        val byteBuffer = buffer.getBuffer(false)
        val lastItem = byteBuffer[buffer.size - 1]
        return lastItem.toDouble()
    }

    override fun setAllValuesTo(buffer: ArrayBuffer, value: Double) {
        val byteBuffer = buffer.getBuffer(false)
        byteBuffer.rewind()
        val byte = value.toInt().toByte()
        while (byteBuffer.hasRemaining()) {
            byteBuffer.put(byte)
        }
    }

    override fun copyBuffer(buffer: ArrayBuffer): ArrayBuffer {
        return ArrayBuffer.copy(buffer)
    }

    override fun bounceArrayBuffer(buffer: ArrayBuffer): ArrayBuffer {
        return buffer
    }

    override fun createChild(): HybridChildSpec {
        return HybridChild()
    }

    override fun createBase(): HybridBaseSpec {
        return HybridBase()
    }

    override fun createBaseActualChild(): HybridBaseSpec {
        return HybridChild()
    }

    override fun bounceChild(child: HybridChildSpec): HybridChildSpec {
        return child
    }

    override fun bounceBase(base: HybridBaseSpec): HybridBaseSpec {
        return base
    }

    override fun bounceChildBase(child: HybridChildSpec): HybridBaseSpec {
        return child
    }

    override fun castBase(base: HybridBaseSpec): HybridChildSpec {
        if (base !is HybridChildSpec) {
            throw Error("Cannot cast Base to Child!")
        }
        return base
    }

    override fun newTestObject(): HybridTestObjectSwiftKotlinSpec {
        return HybridTestObjectKotlin()
    }

    override fun getIsViewBlue(view: HybridTestViewSpec): Boolean {
        val cast = view as? HybridTestView ?: return false
        return cast.isBlue
    }

    override fun callbackSync(callback: () -> Double): Double {
        val value = callback()
        return value
    }
}
