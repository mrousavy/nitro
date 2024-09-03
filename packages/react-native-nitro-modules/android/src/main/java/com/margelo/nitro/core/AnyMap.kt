package com.margelo.nitro.core

import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip
import dalvik.annotation.optimization.CriticalNative

/**
 * Represents an untyped map of string keys with associated values.
 * This is like a JS [`object`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object).
 */
@Suppress("KotlinJniMissingFunction")
@Keep
@DoNotStrip
class AnyMap {
  private val mHybridData: HybridData

  /**
   * Create a new empty `AnyMap`.
   */
  constructor() {
    mHybridData = initHybrid()
  }

  /**
   * Create a new `AnyMap` from C++, which potentially already holds data.
   */
  @Suppress("unused")
  private constructor(hybridData: HybridData) {
    mHybridData = hybridData
  }


  @CriticalNative
  external fun contains(key: String): Boolean
  @CriticalNative
  external fun remove(key: String)
  @CriticalNative
  external fun clear()

  @CriticalNative
  external fun isNull(key: String): Boolean
  @CriticalNative
  external fun isDouble(key: String): Boolean
  @CriticalNative
  external fun isBoolean(key: String): Boolean
  @CriticalNative
  external fun isBigInt(key: String): Boolean
  @CriticalNative
  external fun isString(key: String): Boolean
  @CriticalNative
  external fun isArray(key: String): Boolean
  @CriticalNative
  external fun isObject(key: String): Boolean

  @CriticalNative
  external fun getDouble(key: String): Double
  @CriticalNative
  external fun getBoolean(key: String): Boolean
  @CriticalNative
  external fun getBigInt(key: String): Long
  external fun getString(key: String): String
  external fun getAnyArray(key: String): AnyArray
  external fun getAnyObject(key: String): AnyObject

  @CriticalNative
  external fun setNull(key: String)
  @CriticalNative
  external fun setDouble(key: String, value: Double)
  @CriticalNative
  external fun setBoolean(key: String, value: Boolean)
  @CriticalNative
  external fun setBigInt(key: String, value: Long)
  @CriticalNative
  external fun setString(key: String, value: String)
  external fun setAnyArray(key: String, value: AnyArray)
  external fun setAnyObject(key: String, value: AnyObject)

  private external fun initHybrid(): HybridData
}
