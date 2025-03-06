package com.margelo.nitro.core

import com.facebook.proguard.annotations.DoNotStrip

/**
 * Represents a variant that holds one of `2` possible value types.
 */
@DoNotStrip
sealed class Variant2<T1, T2> {
  @DoNotStrip
  data class First<T1, T2>(@DoNotStrip val value: T1): Variant2<T1, T2>()
  @DoNotStrip
  data class Second<T1, T2>(@DoNotStrip val value: T2): Variant2<T1, T2>()

  inline fun <reified T> getAs(): T? = when (this) {
    is First -> value as? T
    is Second -> value as? T
  }

  val isFirst: Boolean
    get() = this is First
  val isSecond: Boolean
    get() = this is Second

  companion object {
    @JvmStatic
    @DoNotStrip
    fun <T1, T2> first(value: T1): Variant2<T1, T2> = First(value)
    @JvmStatic
    @DoNotStrip
    fun <T1, T2> second(value: T2): Variant2<T1, T2> = Second(value)
  }
}

/**
 * Represents a variant that holds one of `3` possible value types.
 */
@DoNotStrip
sealed class Variant3<T1, T2, T3> {
  @DoNotStrip
  data class First<T1, T2, T3>(@DoNotStrip val value: T1): Variant3<T1, T2, T3>()
  @DoNotStrip
  data class Second<T1, T2, T3>(@DoNotStrip val value: T2): Variant3<T1, T2, T3>()
  @DoNotStrip
  data class Third<T1, T2, T3>(@DoNotStrip val value: T3): Variant3<T1, T2, T3>()

  inline fun <reified T> getAs(): T? = when (this) {
    is First -> value as? T
    is Second -> value as? T
    is Third -> value as? T
  }

  val isFirst: Boolean
    get() = this is First
  val isSecond: Boolean
    get() = this is Second
  val isThird: Boolean
    get() = this is Third

  companion object {
    @JvmStatic
    @DoNotStrip
    fun <T1, T2, T3> first(value: T1): Variant3<T1, T2, T3> = First(value)
    @JvmStatic
    @DoNotStrip
    fun <T1, T2, T3> second(value: T2): Variant3<T1, T2, T3> = Second(value)
    @JvmStatic
    @DoNotStrip
    fun <T1, T2, T3> third(value: T3): Variant3<T1, T2, T3> = Third(value)
  }
}

/**
 * Represents a variant that holds one of `4` possible value types.
 */
@DoNotStrip
sealed class Variant4<T1, T2, T3, T4> {
  @DoNotStrip
  data class First<T1, T2, T3, T4>(@DoNotStrip val value: T1): Variant4<T1, T2, T3, T4>()
  @DoNotStrip
  data class Second<T1, T2, T3, T4>(@DoNotStrip val value: T2): Variant4<T1, T2, T3, T4>()
  @DoNotStrip
  data class Third<T1, T2, T3, T4>(@DoNotStrip val value: T3): Variant4<T1, T2, T3, T4>()
  @DoNotStrip
  data class Fourth<T1, T2, T3, T4>(@DoNotStrip val value: T4): Variant4<T1, T2, T3, T4>()

  inline fun <reified T> getAs(): T? = when (this) {
    is First -> value as? T
    is Second -> value as? T
    is Third -> value as? T
    is Fourth -> value as? T
  }

  val isFirst: Boolean
    get() = this is First
  val isSecond: Boolean
    get() = this is Second
  val isThird: Boolean
    get() = this is Third
  val isFourth: Boolean
    get() = this is Fourth

  companion object {
    @JvmStatic
    @DoNotStrip
    fun <T1, T2, T3, T4> first(value: T1): Variant4<T1, T2, T3, T4> = First(value)
    @JvmStatic
    @DoNotStrip
    fun <T1, T2, T3, T4> second(value: T2): Variant4<T1, T2, T3, T4> = Second(value)
    @JvmStatic
    @DoNotStrip
    fun <T1, T2, T3, T4> third(value: T3): Variant4<T1, T2, T3, T4> = Third(value)
    @JvmStatic
    @DoNotStrip
    fun <T1, T2, T3, T4> fourth(value: T4): Variant4<T1, T2, T3, T4> = Fourth(value)
  }
}

/**
 * Represents a variant that holds one of `5` possible value types.
 */
@DoNotStrip
sealed class Variant5<T1, T2, T3, T4, T5> {
  @DoNotStrip
  data class First<T1, T2, T3, T4, T5>(@DoNotStrip val value: T1): Variant5<T1, T2, T3, T4, T5>()
  @DoNotStrip
  data class Second<T1, T2, T3, T4, T5>(@DoNotStrip val value: T2): Variant5<T1, T2, T3, T4, T5>()
  @DoNotStrip
  data class Third<T1, T2, T3, T4, T5>(@DoNotStrip val value: T3): Variant5<T1, T2, T3, T4, T5>()
  @DoNotStrip
  data class Fourth<T1, T2, T3, T4, T5>(@DoNotStrip val value: T4): Variant5<T1, T2, T3, T4, T5>()
  @DoNotStrip
  data class Fifth<T1, T2, T3, T4, T5>(@DoNotStrip val value: T5): Variant5<T1, T2, T3, T4, T5>()

  inline fun <reified T> getAs(): T? = when (this) {
    is First -> value as? T
    is Second -> value as? T
    is Third -> value as? T
    is Fourth -> value as? T
    is Fifth -> value as? T
  }

  val isFirst: Boolean
    get() = this is First
  val isSecond: Boolean
    get() = this is Second
  val isThird: Boolean
    get() = this is Third
  val isFourth: Boolean
    get() = this is Fourth
  val isFifth: Boolean
    get() = this is Fifth

  companion object {
    @JvmStatic
    @DoNotStrip
    fun <T1, T2, T3, T4, T5> first(value: T1): Variant5<T1, T2, T3, T4, T5> = First(value)
    @JvmStatic
    @DoNotStrip
    fun <T1, T2, T3, T4, T5> second(value: T2): Variant5<T1, T2, T3, T4, T5> = Second(value)
    @JvmStatic
    @DoNotStrip
    fun <T1, T2, T3, T4, T5> third(value: T3): Variant5<T1, T2, T3, T4, T5> = Third(value)
    @JvmStatic
    @DoNotStrip
    fun <T1, T2, T3, T4, T5> fourth(value: T4): Variant5<T1, T2, T3, T4, T5> = Fourth(value)
    @JvmStatic
    @DoNotStrip
    fun <T1, T2, T3, T4, T5> fifth(value: T5): Variant5<T1, T2, T3, T4, T5> = Fifth(value)
  }
}
