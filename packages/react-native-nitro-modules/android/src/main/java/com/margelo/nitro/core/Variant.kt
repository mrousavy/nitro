package com.margelo.nitro.core

sealed class Variant2<out A, out B> {
    data class First<A>(val value: A) : Variant2<A, Nothing>()
    data class Second<B>(val value: B) : Variant2<Nothing, B>()

    inline fun <reified T> getAs(): T? = when (this) {
        is First -> value as? T
        is Second -> value as? T
    }
}

sealed class Variant3<out A, out B, out C> {
    data class First<A>(val value: A) : Variant3<A, Nothing, Nothing>()
    data class Second<B>(val value: B) : Variant3<Nothing, B, Nothing>()
    data class Third<C>(val value: C) : Variant3<Nothing, Nothing, C>()

    inline fun <reified T> getAs(): T? = when (this) {
        is First -> value as? T
        is Second -> value as? T
        is Third -> value as? T
    }
}

sealed class Variant4<out A, out B, out C, out D> {
    data class First<A>(val value: A) : Variant4<A, Nothing, Nothing, Nothing>()
    data class Second<B>(val value: B) : Variant4<Nothing, B, Nothing, Nothing>()
    data class Third<C>(val value: C) : Variant4<Nothing, Nothing, C, Nothing>()
    data class Fourth<D>(val value: D) : Variant4<Nothing, Nothing, Nothing, D>()

    inline fun <reified T> getAs(): T? = when (this) {
        is First -> value as? T
        is Second -> value as? T
        is Third -> value as? T
        is Fourth -> value as? T
    }
}

sealed class Variant5<out A, out B, out C, out D, out E> {
    data class First<A>(val value: A) : Variant5<A, Nothing, Nothing, Nothing, Nothing>()
    data class Second<B>(val value: B) : Variant5<Nothing, B, Nothing, Nothing, Nothing>()
    data class Third<C>(val value: C) : Variant5<Nothing, Nothing, C, Nothing, Nothing>()
    data class Fourth<D>(val value: D) : Variant5<Nothing, Nothing, Nothing, D, Nothing>()
    data class Fifth<E>(val value: E) : Variant5<Nothing, Nothing, Nothing, Nothing, E>()

    inline fun <reified T> getAs(): T? = when (this) {
        is First -> value as? T
        is Second -> value as? T
        is Third -> value as? T
        is Fourth -> value as? T
        is Fifth -> value as? T
    }
}

sealed class Variant6<out A, out B, out C, out D, out E, out F> {
    data class First<A>(val value: A) : Variant6<A, Nothing, Nothing, Nothing, Nothing, Nothing>()
    data class Second<B>(val value: B) : Variant6<Nothing, B, Nothing, Nothing, Nothing, Nothing>()
    data class Third<C>(val value: C) : Variant6<Nothing, Nothing, C, Nothing, Nothing, Nothing>()
    data class Fourth<D>(val value: D) : Variant6<Nothing, Nothing, Nothing, D, Nothing, Nothing>()
    data class Fifth<E>(val value: E) : Variant6<Nothing, Nothing, Nothing, Nothing, E, Nothing>()
    data class Sixth<F>(val value: F) : Variant6<Nothing, Nothing, Nothing, Nothing, Nothing, F>()

    inline fun <reified T> getAs(): T? = when (this) {
        is First -> value as? T
        is Second -> value as? T
        is Third -> value as? T
        is Fourth -> value as? T
        is Fifth -> value as? T
        is Sixth -> value as? T
    }
}

sealed class Variant7<out A, out B, out C, out D, out E, out F, out G> {
  data class First<A>(val value: A) : Variant7<A, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing>()
  data class Second<B>(val value: B) : Variant7<Nothing, B, Nothing, Nothing, Nothing, Nothing, Nothing>()
  data class Third<C>(val value: C) : Variant7<Nothing, Nothing, C, Nothing, Nothing, Nothing, Nothing>()
  data class Fourth<D>(val value: D) : Variant7<Nothing, Nothing, Nothing, D, Nothing, Nothing, Nothing>()
  data class Fifth<E>(val value: E) : Variant7<Nothing, Nothing, Nothing, Nothing, E, Nothing, Nothing>()
  data class Sixth<F>(val value: F) : Variant7<Nothing, Nothing, Nothing, Nothing, Nothing, F, Nothing>()
  data class Seventh<G>(val value: G) : Variant7<Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, G>()

  inline fun <reified T> getAs(): T? = when (this) {
      is First -> value as? T
      is Second -> value as? T
      is Third -> value as? T
      is Fourth -> value as? T
      is Fifth -> value as? T
      is Sixth -> value as? T
      is Seventh -> value as? T
  }
}

sealed class Variant8<out A, out B, out C, out D, out E, out F, out G, out H> {
  data class First<A>(val value: A) : Variant8<A, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing>()
  data class Second<B>(val value: B) : Variant8<Nothing, B, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing>()
  data class Third<C>(val value: C) : Variant8<Nothing, Nothing, C, Nothing, Nothing, Nothing, Nothing, Nothing>()
  data class Fourth<D>(val value: D) : Variant8<Nothing, Nothing, Nothing, D, Nothing, Nothing, Nothing, Nothing>()
  data class Fifth<E>(val value: E) : Variant8<Nothing, Nothing, Nothing, Nothing, E, Nothing, Nothing, Nothing>()
  data class Sixth<F>(val value: F) : Variant8<Nothing, Nothing, Nothing, Nothing, Nothing, F, Nothing, Nothing>()
  data class Seventh<G>(val value: G) : Variant8<Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, G, Nothing>()
  data class Eighth<H>(val value: H) : Variant8<Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, H>()

  inline fun <reified T> getAs(): T? = when (this) {
      is First -> value as? T
      is Second -> value as? T
      is Third -> value as? T
      is Fourth -> value as? T
      is Fifth -> value as? T
      is Sixth -> value as? T
      is Seventh -> value as? T
      is Eighth -> value as? T
  }
}

sealed class Variant9<out A, out B, out C, out D, out E, out F, out G, out H, out I> {
  data class First<A>(val value: A) : Variant9<A, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing>()
  data class Second<B>(val value: B) : Variant9<Nothing, B, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing>()
  data class Third<C>(val value: C) : Variant9<Nothing, Nothing, C, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing>()
  data class Fourth<D>(val value: D) : Variant9<Nothing, Nothing, Nothing, D, Nothing, Nothing, Nothing, Nothing, Nothing>()
  data class Fifth<E>(val value: E) : Variant9<Nothing, Nothing, Nothing, Nothing, E, Nothing, Nothing, Nothing, Nothing>()
  data class Sixth<F>(val value: F) : Variant9<Nothing, Nothing, Nothing, Nothing, Nothing, F, Nothing, Nothing, Nothing>()
  data class Seventh<G>(val value: G) : Variant9<Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, G, Nothing, Nothing>()
  data class Eighth<H>(val value: H) : Variant9<Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, H, Nothing>()
  data class Ninth<I>(val value: I) : Variant9<Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, I>()

  inline fun <reified T> getAs(): T? = when (this) {
      is First -> value as? T
      is Second -> value as? T
      is Third -> value as? T
      is Fourth -> value as? T
      is Fifth -> value as? T
      is Sixth -> value as? T
      is Seventh -> value as? T
      is Eighth -> value as? T
      is Ninth -> value as? T
  }
}
