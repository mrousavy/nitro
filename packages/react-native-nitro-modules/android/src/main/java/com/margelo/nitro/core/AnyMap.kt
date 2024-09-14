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
  private val map: HashMap<String, Any> by lazy { getJavaMap() }

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

  fun contains(key: String): Boolean {
    return map.contains(key)
  }

  fun remove(key: String) {
    map.remove(key)
  }

  fun clear() {
    map.clear()
  }

  fun isNull(key: String): Boolean {
    return map[key] == null
  }

  fun isDouble(key: String): Boolean {
    return map[key] is Double
  }

  fun isBoolean(key: String): Boolean {
    return map[key] is Boolean
  }

  fun isBigInt(key: String): Boolean {
    return map[key] is Long
  }

  fun isString(key: String): Boolean {
    return map[key] is String
  }

  fun isArray(key: String): Boolean {
    return map[key] is Array<*>
  }

  fun isObject(key: String): Boolean {
    return map[key] is Map<*, *>
  }

  fun getDouble(key: String): Double {
    return map[key] as Double
  }

  fun getBoolean(key: String): Boolean {
    return map[key] as Boolean
  }

  fun getBigInt(key: String): Long {
    return map[key] as Long
  }

  fun getString(key: String): String {
    return map[key] as String
  }

  fun getAnyArray(key: String): Array<Any> {
    return map[key] as Array<Any>
  }

  fun getAnyObject(key: String): Map<String, Any> {
    return map[key] as Map<String, Any>
  }


  fun setNull(key: String) {
    // TODO: Actually set a null instance?
    remove(key)
  }

  fun setDouble(key: String, value: Double) {
    map[key] = value
  }

  fun setBoolean(key: String, value: Boolean) {
    map[key] = value
  }

  fun setBigInt(key: String, value: Long) {
    map[key] = value
  }

  fun setString(key: String, value: String) {
    map[key] = value
  }

  fun setAnyArray(key: String, value: Array<Any>) {
    map[key] = value
  }

  fun setAnyObject(key: String, value: Map<String, Any>) {
    map[key] = value
  }

  private external fun getJavaMap(): HashMap<String, Any>
  private external fun initHybrid(): HybridData
}
