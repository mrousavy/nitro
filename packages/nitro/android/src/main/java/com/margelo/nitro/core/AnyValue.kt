package com.margelo.nitro.core

import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip
import dalvik.annotation.optimization.FastNative

typealias AnyArray = Array<AnyValue>
typealias AnyObject = Map<String, AnyValue>

/**
 * Represents a value that can be any of the following types:
 * - `null`
 * - [Double]
 * - [Boolean]
 * - [Long]
 * - [String]
 * - [AnyArray] ([Array]`<AnyValue>`)
 * - [AnyObject] ([Map]`<String, AnyValue>`)
 */
@Suppress("KotlinJniMissingFunction")
@Keep
@DoNotStrip
class AnyValue {
    private val mHybridData: HybridData

    /**
     * Create a new [AnyValue] that holds `null`.
     */
    constructor() {
        mHybridData = initHybrid()
    }

    /**
     * Create a new [AnyValue] that holds the given [Double]
     */
    constructor(value: Double) {
        mHybridData = initHybrid(value)
    }

    /**
     * Create a new [AnyValue] that holds the given [Boolean]
     */
    constructor(value: Boolean) {
        mHybridData = initHybrid(value)
    }

    /**
     * Create a new [AnyValue] that holds the given [Long]
     */
    constructor(value: Long) {
        mHybridData = initHybrid(value)
    }

    /**
     * Create a new [AnyValue] that holds the given [String]
     */
    constructor(value: String) {
        mHybridData = initHybrid(value)
    }

    /**
     * Create a new [AnyValue] that holds the given [AnyArray]
     */
    constructor(value: AnyArray) {
        mHybridData = initHybrid(value)
    }

    /**
     * Create a new [AnyValue] that holds the given [AnyObject]
     */
    constructor(value: AnyObject) {
        mHybridData = initHybrid(value)
    }

    /**
     * Gets whether this [AnyValue] instance is holding a `null`.
     */
    @FastNative
    external fun isNull(): Boolean

    /**
     * Gets whether this [AnyValue] instance is holding a [Double] value.
     */
    @FastNative
    external fun isDouble(): Boolean

    /**
     * Gets whether this [AnyValue] instance is holding a [Boolean] value.
     */
    @FastNative
    external fun isBoolean(): Boolean

    /**
     * Gets whether this [AnyValue] instance is holding a [Long] value.
     */
    @FastNative
    external fun isBigInt(): Boolean

    /**
     * Gets whether this [AnyValue] instance is holding a [String] value.
     */
    @FastNative
    external fun isString(): Boolean

    /**
     * Gets whether this [AnyValue] instance is holding an [AnyArray] value.
     */
    @FastNative
    external fun isAnyArray(): Boolean

    /**
     * Gets whether this [AnyValue] instance is holding an [AnyObject] value.
     */
    @FastNative
    external fun isAnyObject(): Boolean

    /**
     * Get the [Double] value this [AnyValue] is holding.
     * @throws Error if this [AnyValue] is not holding a [Double] (see [isDouble]`()`)
     */
    @FastNative
    external fun asDouble(): Double

    /**
     * Get the [Boolean] value this [AnyValue] is holding.
     * @throws Error if this [AnyValue] is not holding a [Boolean] (see [isBoolean]`()`)
     */
    @FastNative
    external fun asBoolean(): Boolean

    /**
     * Get the [Long] value this [AnyValue] is holding.
     * @throws Error if this [AnyValue] is not holding a [Long] (see [isLong]`()`)
     */
    @FastNative
    external fun asBigInt(): Long

    /**
     * Get the [String] value this [AnyValue] is holding.
     * @throws Error if this [AnyValue] is not holding a [String] (see [isString]`()`)
     */
    external fun asString(): String

    /**
     * Get the [AnyArray] value this [AnyValue] is holding.
     * @throws Error if this [AnyValue] is not holding an [AnyArray] (see [isAnyArray]`()`)
     */
    external fun asAnyArray(): AnyArray

    /**
     * Get the [AnyObject] value this [AnyValue] is holding.
     * @throws Error if this [AnyValue] is not holding an [AnyObject] (see [isAnyObject]`()`)
     */
    external fun asAnyObject(): AnyObject

    private external fun initHybrid(): HybridData
    private external fun initHybrid(value: Double): HybridData
    private external fun initHybrid(value: Boolean): HybridData
    private external fun initHybrid(value: Long): HybridData
    private external fun initHybrid(value: String): HybridData
    private external fun initHybrid(value: AnyArray): HybridData
    private external fun initHybrid(value: AnyObject): HybridData
}
