package com.margelo.nitro.core

import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip
import dalvik.annotation.optimization.FastNative

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


  @FastNative
  external fun contains(key: String): Boolean
  @FastNative
  external fun remove(key: String)
  @FastNative
  external fun clear()
  external fun getAllKeys(): Array<String>

  @FastNative
  external fun isNull(key: String): Boolean
  @FastNative
  external fun isDouble(key: String): Boolean
  @FastNative
  external fun isBoolean(key: String): Boolean
  @FastNative
  external fun isBigInt(key: String): Boolean
  @FastNative
  external fun isString(key: String): Boolean
  @FastNative
  external fun isArray(key: String): Boolean
  @FastNative
  external fun isObject(key: String): Boolean

  @FastNative
  external fun getDouble(key: String): Double
  @FastNative
  external fun getBoolean(key: String): Boolean
  @FastNative
  external fun getBigInt(key: String): Long
  external fun getString(key: String): String
  external fun getAnyArray(key: String): AnyArray
  external fun getAnyObject(key: String): AnyObject

  @FastNative
  external fun setNull(key: String)
  @FastNative
  external fun setDouble(key: String, value: Double)
  @FastNative
  external fun setBoolean(key: String, value: Boolean)
  @FastNative
  external fun setBigInt(key: String, value: Long)
  @FastNative
  external fun setString(key: String, value: String)
  external fun setAnyArray(key: String, value: AnyArray)
  external fun setAnyObject(key: String, value: AnyObject)

  private external fun initHybrid(): HybridData
}
