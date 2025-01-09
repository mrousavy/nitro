///
/// HybridTestObjectSwiftKotlinSpec.kt
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

package com.margelo.nitro.image

import android.util.Log
import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.core.*

/**
 * A Kotlin class representing the TestObjectSwiftKotlin HybridObject.
 * Implement this abstract class to create Kotlin-based instances of TestObjectSwiftKotlin.
 */
@DoNotStrip
@Keep
@Suppress(
  "KotlinJniMissingFunction", "unused",
  "LocalVariableName", "PropertyName", "FunctionName",
  "RedundantSuppression", "RedundantUnitReturnType"
)
abstract class HybridTestObjectSwiftKotlinSpec: HybridObject() {
  @DoNotStrip
  private var mHybridData: HybridData = initHybrid()

  init {
    // Pass this `HybridData` through to it's base class,
    // to represent inheritance to JHybridObject on C++ side
    super.updateNative(mHybridData)
  }

  /**
   * Call from a child class to initialize HybridData with a child.
   */
  override fun updateNative(hybridData: HybridData) {
    mHybridData = hybridData
  }

  // Properties
  @get:DoNotStrip
  @get:Keep
  abstract val thisObject: HybridTestObjectSwiftKotlinSpec
  
  @get:DoNotStrip
  @get:Keep
  @set:DoNotStrip
  @set:Keep
  abstract var optionalHybrid: HybridTestObjectSwiftKotlinSpec?
  
  @get:DoNotStrip
  @get:Keep
  @set:DoNotStrip
  @set:Keep
  abstract var numberValue: Double
  
  @get:DoNotStrip
  @get:Keep
  @set:DoNotStrip
  @set:Keep
  abstract var boolValue: Boolean
  
  @get:DoNotStrip
  @get:Keep
  @set:DoNotStrip
  @set:Keep
  abstract var stringValue: String
  
  @get:DoNotStrip
  @get:Keep
  @set:DoNotStrip
  @set:Keep
  abstract var bigintValue: Long
  
  @get:DoNotStrip
  @get:Keep
  @set:DoNotStrip
  @set:Keep
  abstract var stringOrUndefined: String?
  
  @get:DoNotStrip
  @get:Keep
  @set:DoNotStrip
  @set:Keep
  abstract var stringOrNull: String?
  
  @get:DoNotStrip
  @get:Keep
  @set:DoNotStrip
  @set:Keep
  abstract var optionalString: String?
  
  @get:DoNotStrip
  @get:Keep
  @set:DoNotStrip
  @set:Keep
  abstract var optionalArray: Array<String>?
  
  @get:DoNotStrip
  @get:Keep
  @set:DoNotStrip
  @set:Keep
  abstract var optionalEnum: Powertrain?
  
  @get:DoNotStrip
  @get:Keep
  @set:DoNotStrip
  @set:Keep
  abstract var optionalOldEnum: OldEnum?
  
  abstract var optionalCallback: ((value: Double) -> Unit)?
  
  private var optionalCallback_cxx: ((value: Double) -> Unit)?
    @Keep
    @DoNotStrip
    get() {
      return optionalCallback
    }
    @Keep
    @DoNotStrip
    set(value) {
      optionalCallback = value
    }
  
  @get:DoNotStrip
  @get:Keep
  @set:DoNotStrip
  @set:Keep
  abstract var someVariant: Variant_String_Double

  // Methods
  @DoNotStrip
  @Keep
  abstract fun newTestObject(): HybridTestObjectSwiftKotlinSpec
  
  @DoNotStrip
  @Keep
  abstract fun simpleFunc(): Unit
  
  @DoNotStrip
  @Keep
  abstract fun addNumbers(a: Double, b: Double): Double
  
  @DoNotStrip
  @Keep
  abstract fun addStrings(a: String, b: String): String
  
  @DoNotStrip
  @Keep
  abstract fun multipleArguments(num: Double, str: String, boo: Boolean): Unit
  
  @DoNotStrip
  @Keep
  abstract fun bounceStrings(array: Array<String>): Array<String>
  
  @DoNotStrip
  @Keep
  abstract fun bounceNumbers(array: DoubleArray): DoubleArray
  
  @DoNotStrip
  @Keep
  abstract fun bounceStructs(array: Array<Person>): Array<Person>
  
  @DoNotStrip
  @Keep
  abstract fun bounceEnums(array: Array<Powertrain>): Array<Powertrain>
  
  abstract fun complexEnumCallback(array: Array<Powertrain>, callback: (array: Array<Powertrain>) -> Unit): Unit
  
  @DoNotStrip
  @Keep
  private fun complexEnumCallback_cxx(array: Array<Powertrain>, callback: Func_void_std__vector_Powertrain_): Unit {
    val __result = complexEnumCallback(array, callback.toLambda())
    return __result
  }
  
  @DoNotStrip
  @Keep
  abstract fun createMap(): AnyMap
  
  @DoNotStrip
  @Keep
  abstract fun mapRoundtrip(map: AnyMap): AnyMap
  
  @DoNotStrip
  @Keep
  abstract fun funcThatThrows(): Double
  
  @DoNotStrip
  @Keep
  abstract fun funcThatThrowsBeforePromise(): Promise<Unit>
  
  @DoNotStrip
  @Keep
  abstract fun throwError(error: Throwable): Unit
  
  @DoNotStrip
  @Keep
  abstract fun tryOptionalParams(num: Double, boo: Boolean, str: String?): String
  
  @DoNotStrip
  @Keep
  abstract fun tryMiddleParam(num: Double, boo: Boolean?, str: String): String
  
  @DoNotStrip
  @Keep
  abstract fun tryOptionalEnum(value: Powertrain?): Powertrain?
  
  @DoNotStrip
  @Keep
  abstract fun calculateFibonacciSync(value: Double): Long
  
  @DoNotStrip
  @Keep
  abstract fun calculateFibonacciAsync(value: Double): Promise<Long>
  
  @DoNotStrip
  @Keep
  abstract fun wait(seconds: Double): Promise<Unit>
  
  @DoNotStrip
  @Keep
  abstract fun promiseThrows(): Promise<Unit>
  
  @DoNotStrip
  @Keep
  abstract fun awaitAndGetPromise(promise: Promise<Double>): Promise<Double>
  
  @DoNotStrip
  @Keep
  abstract fun awaitAndGetComplexPromise(promise: Promise<Car>): Promise<Car>
  
  @DoNotStrip
  @Keep
  abstract fun awaitPromise(promise: Promise<Unit>): Promise<Unit>
  
  abstract fun callCallback(callback: () -> Unit): Unit
  
  @DoNotStrip
  @Keep
  private fun callCallback_cxx(callback: Func_void): Unit {
    val __result = callCallback(callback.toLambda())
    return __result
  }
  
  abstract fun callAll(first: () -> Unit, second: () -> Unit, third: () -> Unit): Unit
  
  @DoNotStrip
  @Keep
  private fun callAll_cxx(first: Func_void, second: Func_void, third: Func_void): Unit {
    val __result = callAll(first.toLambda(), second.toLambda(), third.toLambda())
    return __result
  }
  
  abstract fun callWithOptional(value: Double?, callback: (maybe: Double?) -> Unit): Unit
  
  @DoNotStrip
  @Keep
  private fun callWithOptional_cxx(value: Double?, callback: Func_void_std__optional_double_): Unit {
    val __result = callWithOptional(value, callback.toLambda())
    return __result
  }
  
  abstract fun callSumUpNTimes(callback: () -> Promise<Double>, n: Double): Promise<Double>
  
  @DoNotStrip
  @Keep
  private fun callSumUpNTimes_cxx(callback: Func_std__shared_ptr_Promise_double__, n: Double): Promise<Double> {
    val __result = callSumUpNTimes(callback.toLambda(), n)
    return __result
  }
  
  abstract fun callbackAsyncPromise(callback: () -> Promise<Promise<Double>>): Promise<Double>
  
  @DoNotStrip
  @Keep
  private fun callbackAsyncPromise_cxx(callback: Func_std__shared_ptr_Promise_std__shared_ptr_Promise_double____): Promise<Double> {
    val __result = callbackAsyncPromise(callback.toLambda())
    return __result
  }
  
  abstract fun callbackAsyncPromiseBuffer(callback: () -> Promise<Promise<ArrayBuffer>>): Promise<ArrayBuffer>
  
  @DoNotStrip
  @Keep
  private fun callbackAsyncPromiseBuffer_cxx(callback: Func_std__shared_ptr_Promise_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer_____): Promise<ArrayBuffer> {
    val __result = callbackAsyncPromiseBuffer(callback.toLambda())
    return __result
  }
  
  abstract fun getComplexCallback(): (value: Double) -> Unit
  
  @DoNotStrip
  @Keep
  private fun getComplexCallback_cxx(): Func_void_double {
    val __result = getComplexCallback()
    throw Error("not yet implemented!")
  }
  
  abstract fun getValueFromJSCallbackAndWait(getValue: () -> Promise<Double>): Promise<Double>
  
  @DoNotStrip
  @Keep
  private fun getValueFromJSCallbackAndWait_cxx(getValue: Func_std__shared_ptr_Promise_double__): Promise<Double> {
    val __result = getValueFromJSCallbackAndWait(getValue.toLambda())
    return __result
  }
  
  abstract fun getValueFromJsCallback(callback: () -> Promise<String>, andThenCall: (valueFromJs: String) -> Unit): Promise<Unit>
  
  @DoNotStrip
  @Keep
  private fun getValueFromJsCallback_cxx(callback: Func_std__shared_ptr_Promise_std__string__, andThenCall: Func_void_std__string): Promise<Unit> {
    val __result = getValueFromJsCallback(callback.toLambda(), andThenCall.toLambda())
    return __result
  }
  
  @DoNotStrip
  @Keep
  abstract fun getCar(): Car
  
  @DoNotStrip
  @Keep
  abstract fun isCarElectric(car: Car): Boolean
  
  @DoNotStrip
  @Keep
  abstract fun getDriver(car: Car): Person?
  
  abstract fun jsStyleObjectAsParameters(params: JsStyleStruct): Unit
  
  @DoNotStrip
  @Keep
  private fun jsStyleObjectAsParameters_cxx(params: JsStyleStruct): Unit {
    val __result = jsStyleObjectAsParameters(params)
    return __result
  }
  
  @DoNotStrip
  @Keep
  abstract fun createArrayBuffer(): ArrayBuffer
  
  @DoNotStrip
  @Keep
  abstract fun getBufferLastItem(buffer: ArrayBuffer): Double
  
  @DoNotStrip
  @Keep
  abstract fun setAllValuesTo(buffer: ArrayBuffer, value: Double): Unit
  
  @DoNotStrip
  @Keep
  abstract fun createArrayBufferAsync(): Promise<ArrayBuffer>
  
  @DoNotStrip
  @Keep
  abstract fun createChild(): HybridChildSpec
  
  @DoNotStrip
  @Keep
  abstract fun createBase(): HybridBaseSpec
  
  @DoNotStrip
  @Keep
  abstract fun createBaseActualChild(): HybridBaseSpec
  
  @DoNotStrip
  @Keep
  abstract fun bounceChild(child: HybridChildSpec): HybridChildSpec
  
  @DoNotStrip
  @Keep
  abstract fun bounceBase(base: HybridBaseSpec): HybridBaseSpec
  
  @DoNotStrip
  @Keep
  abstract fun bounceChildBase(child: HybridChildSpec): HybridBaseSpec
  
  @DoNotStrip
  @Keep
  abstract fun castBase(base: HybridBaseSpec): HybridChildSpec

  private external fun initHybrid(): HybridData

  companion object {
    private const val TAG = "HybridTestObjectSwiftKotlinSpec"
    init {
      try {
        Log.i(TAG, "Loading NitroImage C++ library...")
        System.loadLibrary("NitroImage")
        Log.i(TAG, "Successfully loaded NitroImage C++ library!")
      } catch (e: Error) {
        Log.e(TAG, "Failed to load NitroImage C++ library! Is it properly installed and linked? " +
                    "Is the name correct? (see `CMakeLists.txt`, at `add_library(...)`)", e)
        throw e
      }
    }
  }
}
