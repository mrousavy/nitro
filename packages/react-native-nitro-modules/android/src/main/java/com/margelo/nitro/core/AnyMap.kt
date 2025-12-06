package com.margelo.nitro.core

import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip
import dalvik.annotation.optimization.FastNative
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

  fun toMap(): Map<String, Any?> {
    val map = HashMap<String, Any?>()
    for (key in getAllKeys()) {
      map.put(key, getAny(key))
    }
    return map
  }

  fun setAny(
    key: String,
    value: Any?,
  ) {
    setAnyValue(key, AnyValue.fromAny(value))
  }

  fun getAny(key: String): Any? {
    return getAnyValue(key).toAny()
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

  private external fun getAnyValue(key: String): AnyValue

  @FastNative
  external fun setNull(key: String)

  @FastNative
  external fun setDouble(
    key: String,
    value: Double,
  )

  @FastNative
  external fun setBoolean(
    key: String,
    value: Boolean,
  )

  @FastNative
  external fun setBigInt(
    key: String,
    value: Long,
  )

  @FastNative
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


  /**
   * Get the type tag for a value at the given key.
   * Returns: 0=null, 1=boolean, 2=double, 3=bigint, 4=string, 5=array, 6=object
   */
  @FastNative
  external fun getType(key: String): Int

  /**
   * Get the size of the map in a single call.
   */
  @FastNative
  external fun getSize(): Int

  /**
   * Get all keys with their type tags in a single JNI call.
   * Returns an array of [key1, type1, key2, type2, ...]
   */
  external fun getAllKeysWithTypes(): Array<String>

  /**
   * Batch get: Returns all primitive values in a single JNI call.
   * Returns: Array of [key, typeTag, value, ...] triplets
   */
  external fun getAllPrimitiveValues(): Array<String>

  /**
   * Convert to a Map<String, Any?> using optimized batch operations.
   * This is much faster than calling getAny() for each key individually.
   */
  fun toMapFast(): Map<String, Any?> {
    val primitives = getAllPrimitiveValues()
    val result = HashMap<String, Any?>(primitives.size / 3)

    var i = 0
    while (i < primitives.size) {
      val key = primitives[i]
      val typeTag = primitives[i + 1].toInt()
      val valueStr = primitives[i + 2]

      val value: Any? = when (typeTag) {
        0 -> null // Null
        1 -> valueStr == "true" // Boolean
        2 -> valueStr.toDouble() // Double
        3 -> valueStr.toLong() // BigInt
        4 -> valueStr // String
        5 -> getAnyArray(key).map { it.toAny() }.toTypedArray() // Array - needs separate call
        6 -> getAnyObject(key).mapValues { (_, v) -> v.toAny() } // Object - needs separate call
        else -> null
      }
      result[key] = value
      i += 3
    }
    return result
  }

  /**
   * Type tags for AnyValue
   */
  companion object {
    const val TYPE_NULL = 0
    const val TYPE_BOOLEAN = 1
    const val TYPE_DOUBLE = 2
    const val TYPE_BIGINT = 3
    const val TYPE_STRING = 4
    const val TYPE_ARRAY = 5
    const val TYPE_OBJECT = 6

    fun fromMap(
      map: Map<String, Any?>,
      ignoreIncompatible: Boolean = false,
    ): AnyMap {
      val anyMap = AnyMap(map.size)
      for ((key, value) in map) {
        try {
          anyMap.setAny(key, value)
        } catch (error: Throwable) {
          if (ignoreIncompatible) {
            continue
          } else {
            throw error
          }
        }
      }
      return anyMap
    }
  }

  private external fun initHybrid(): HybridData

  private external fun initHybrid(preallocatedSize: Int): HybridData
}
