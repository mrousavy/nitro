package com.margelo.nitro.core

import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip

/**
 * Represents a variant that holds one of `2` possible value types.
 */
@Suppress("KotlinJniMissingFunction", "UNCHECKED_CAST", "FunctionName")
@DoNotStrip
@Keep
class Variant2<T1, T2> {
  @DoNotStrip
  @Keep
  private val mHybridData: HybridData

  @DoNotStrip
  @Keep
  private constructor(hybridData: HybridData) {
    mHybridData = hybridData
  }

  val isFirst: Boolean
    get() = isFirst_cxx()
  val isSecond: Boolean
    get() = isSecond_cxx()

  fun getFirst(): T1 {
    return getFirst_cxx() as T1
  }
  fun getSecond(): T2 {
    return getSecond_cxx() as T2
  }

  private external fun isFirst_cxx(): Boolean
  private external fun isSecond_cxx(): Boolean
  private external fun getFirst_cxx(): Any
  private external fun getSecond_cxx(): Any
}

/**
 * Represents a variant that holds one of `3` possible value types.
 */
@Suppress("KotlinJniMissingFunction", "UNCHECKED_CAST", "FunctionName")
@DoNotStrip
@Keep
class Variant3<T1, T2, T3> {
  @DoNotStrip
  @Keep
  private val mHybridData: HybridData

  @DoNotStrip
  @Keep
  private constructor(hybridData: HybridData) {
    mHybridData = hybridData
  }

  val isFirst: Boolean
    get() = isFirst_cxx()
  val isSecond: Boolean
    get() = isSecond_cxx()
  val isThird: Boolean
    get() = isThird_cxx()

  fun getFirst(): T1 {
    return getFirst_cxx() as T1
  }
  fun getSecond(): T2 {
    return getSecond_cxx() as T2
  }
  fun getThird(): T3 {
    return getThird_cxx() as T3
  }

  private external fun isFirst_cxx(): Boolean
  private external fun isSecond_cxx(): Boolean
  private external fun isThird_cxx(): Boolean
  private external fun getFirst_cxx(): Any
  private external fun getSecond_cxx(): Any
  private external fun getThird_cxx(): Any
}

/**
 * Represents a variant that holds one of `4` possible value types.
 */
@Suppress("KotlinJniMissingFunction", "UNCHECKED_CAST", "FunctionName")
@DoNotStrip
@Keep
class Variant4<T1, T2, T3, T4> {
  @DoNotStrip
  @Keep
  private val mHybridData: HybridData

  @DoNotStrip
  @Keep
  private constructor(hybridData: HybridData) {
    mHybridData = hybridData
  }

  val isFirst: Boolean
    get() = isFirst_cxx()
  val isSecond: Boolean
    get() = isSecond_cxx()
  val isThird: Boolean
    get() = isThird_cxx()
  val isFourth: Boolean
    get() = isFourth_cxx()

  fun getFirst(): T1 {
    return getFirst_cxx() as T1
  }
  fun getSecond(): T2 {
    return getSecond_cxx() as T2
  }
  fun getThird(): T3 {
    return getThird_cxx() as T3
  }
  fun getFourth(): T4 {
    return getFourth_cxx() as T4
  }

  private external fun isFirst_cxx(): Boolean
  private external fun isSecond_cxx(): Boolean
  private external fun isThird_cxx(): Boolean
  private external fun isFourth_cxx(): Boolean
  private external fun getFirst_cxx(): Any
  private external fun getSecond_cxx(): Any
  private external fun getThird_cxx(): Any
  private external fun getFourth_cxx(): Any
}

/**
 * Represents a variant that holds one of `5` possible value types.
 */
@Suppress("KotlinJniMissingFunction", "UNCHECKED_CAST", "FunctionName")
@DoNotStrip
@Keep
class Variant5<T1, T2, T3, T4, T5> {
  @DoNotStrip
  @Keep
  private val mHybridData: HybridData

  @DoNotStrip
  @Keep
  private constructor(hybridData: HybridData) {
    mHybridData = hybridData
  }

  val isFirst: Boolean
    get() = isFirst_cxx()
  val isSecond: Boolean
    get() = isSecond_cxx()
  val isThird: Boolean
    get() = isThird_cxx()
  val isFourth: Boolean
    get() = isFourth_cxx()
  val isFifth: Boolean
    get() = isFifth_cxx()

  fun getFirst(): T1 {
    return getFirst_cxx() as T1
  }
  fun getSecond(): T2 {
    return getSecond_cxx() as T2
  }
  fun getThird(): T3 {
    return getThird_cxx() as T3
  }
  fun getFourth(): T4 {
    return getFourth_cxx() as T4
  }
  fun getFifth(): T5 {
    return getFifth_cxx() as T5
  }

  private external fun isFirst_cxx(): Boolean
  private external fun isSecond_cxx(): Boolean
  private external fun isThird_cxx(): Boolean
  private external fun isFourth_cxx(): Boolean
  private external fun isFifth_cxx(): Boolean
  private external fun getFirst_cxx(): Any
  private external fun getSecond_cxx(): Any
  private external fun getThird_cxx(): Any
  private external fun getFourth_cxx(): Any
  private external fun getFifth_cxx(): Any
}