package com.margelo.nitro.core

import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip
import java.util.Dictionary

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
   * Create a new empty `AnyMap` with the given preallocated size
   */
  constructor(preallocatedSize: Int) {
    mHybridData = initHybrid(preallocatedSize)
  }

  /**
   * Create a new `AnyMap` from C++, which potentially already holds data.
   */
  @Suppress("unused")
  private constructor(hybridData: HybridData) {
    mHybridData = hybridData
  }

  companion object {
    /**
     * Converts the given [map] to a new [AnyMap].
     * @param map The map of keys/value types. Only a number of value types
     * are supported in [AnyMap] - see Nitro docs for more information.
     * @param ignoreIncompatible Whether incompatible key/value pairs should be ignored.
     * If this is `false`, an incompatible key/value pair will throw.
     */
    @JvmStatic
    external fun fromMap(
      map: Map<String, Any?>,
      ignoreIncompatible: Boolean,
    ): AnyMap
  }

  /**
   * Converts this [AnyMap] to a new [HashMap] by
   * copying each key/value.
   */
  external fun toHashMap(): HashMap<String, Any?>

  fun setAny(
    key: String,
    value: Any?,
  ) {
    setAnyValue(key, AnyValue.fromAny(value))
  }

  fun getAny(key: String): Any? {
    return getAnyValue(key).toAny()
  }

  private external fun fromHashMap(
    map: Map<String, Any?>,
    ignoreIncompatible: Boolean,
  )

  external fun contains(key: String): Boolean

  external fun remove(key: String)

  external fun clear()

  external fun getAllKeys(): Array<String>

  external fun isNull(key: String): Boolean

  external fun isDouble(key: String): Boolean

  external fun isBoolean(key: String): Boolean

  external fun isInt64(key: String): Boolean

  external fun isString(key: String): Boolean

  external fun isArray(key: String): Boolean

  external fun isObject(key: String): Boolean

  external fun getDouble(key: String): Double

  external fun getBoolean(key: String): Boolean

  external fun getInt64(key: String): Long

  external fun getString(key: String): String

  external fun getAnyArray(key: String): AnyArray

  external fun getAnyObject(key: String): AnyObject

  private external fun getAnyValue(key: String): AnyValue

  external fun setNull(key: String)

  external fun setDouble(
    key: String,
    value: Double,
  )

  external fun setBoolean(
    key: String,
    value: Boolean,
  )

  external fun setInt64(
    key: String,
    value: Long,
  )

  external fun setString(
    key: String,
    value: String,
  )

  external fun setAnyArray(
    key: String,
    value: AnyArray,
  )

  external fun setAnyObject(
    key: String,
    value: AnyObject,
  )

  private external fun setAnyValue(
    key: String,
    value: AnyValue,
  )

  external fun merge(other: AnyMap)

  private external fun initHybrid(): HybridData

  private external fun initHybrid(preallocatedSize: Int): HybridData
}
