package com.margelo.nitro.core

/**
 * Represents a Variant type that holds one of the specified types.
 */
sealed class Variant<out T> {
    data class Variant1<A>(val value: A) : Variant<A>()
    data class Variant2<A, B>(val value: Either<A, B>) : Variant<Either<A, B>>()
    data class Variant3<A, B, C>(val value: Either3<A, B, C>) : Variant<Either3<A, B, C>>()
    data class Variant4<A, B, C, D>(val value: Either4<A, B, C, D>) : Variant<Either4<A, B, C, D>>()
    data class Variant5<A, B, C, D, E>(val value: Either5<A, B, C, D, E>) : Variant<Either5<A, B, C, D, E>>()
    data class Variant6<A, B, C, D, E, F>(val value: Either6<A, B, C, D, E, F>) : Variant<Either6<A, B, C, D, E, F>>()
    data class Variant7<A, B, C, D, E, F, G>(val value: Either7<A, B, C, D, E, F, G>) : Variant<Either7<A, B, C, D, E, F, G>>()
    data class Variant8<A, B, C, D, E, F, G, H>(val value: Either8<A, B, C, D, E, F, G, H>) : Variant<Either8<A, B, C, D, E, F, G, H>>()
    data class Variant9<A, B, C, D, E, F, G, H, I>(val value: Either9<A, B, C, D, E, F, G, H, I>) : Variant<Either9<A, B, C, D, E, F, G, H, I>>()

    inline fun <reified A> get(): A? = when (this) {
        is Variant1<*> -> value as? A
        is Variant2<*, *> -> (value as? Either.Left)?.value as? A ?: (value as? Either.Right)?.value as? A
        is Variant3<*, *, *> -> value.getAs<A>()
        is Variant4<*, *, *, *> -> value.getAs<A>()
        is Variant5<*, *, *, *, *> -> value.getAs<A>()
        is Variant6<*, *, *, *, *, *> -> value.getAs<A>()
        is Variant7<*, *, *, *, *, *, *> -> value.getAs<A>()
        is Variant8<*, *, *, *, *, *, *, *> -> value.getAs<A>()
        is Variant9<*, *, *, *, *, *, *, *, *> -> value.getAs<A>()
    }
}

sealed class Either<out A, out B> {
    data class Left<A>(val value: A) : Either<A, Nothing>()
    data class Right<B>(val value: B) : Either<Nothing, B>()
}

sealed class Either3<out A, out B, out C> {
    data class First<A>(val value: A) : Either3<A, Nothing, Nothing>()
    data class Second<B>(val value: B) : Either3<Nothing, B, Nothing>()
    data class Third<C>(val value: C) : Either3<Nothing, Nothing, C>()

    inline fun <reified T> getAs(): T? = when (this) {
        is First -> value as? T
        is Second -> value as? T
        is Third -> value as? T
    }
}

sealed class Either4<out A, out B, out C, out D> {
    data class First<A>(val value: A) : Either4<A, Nothing, Nothing, Nothing>()
    data class Second<B>(val value: B) : Either4<Nothing, B, Nothing, Nothing>()
    data class Third<C>(val value: C) : Either4<Nothing, Nothing, C, Nothing>()
    data class Fourth<D>(val value: D) : Either4<Nothing, Nothing, Nothing, D>()

    inline fun <reified T> getAs(): T? = when (this) {
        is First -> value as? T
        is Second -> value as? T
        is Third -> value as? T
        is Fourth -> value as? T
    }
}

sealed class Either5<out A, out B, out C, out D, out E> {
    data class First<A>(val value: A) : Either5<A, Nothing, Nothing, Nothing, Nothing>()
    data class Second<B>(val value: B) : Either5<Nothing, B, Nothing, Nothing, Nothing>()
    data class Third<C>(val value: C) : Either5<Nothing, Nothing, C, Nothing, Nothing>()
    data class Fourth<D>(val value: D) : Either5<Nothing, Nothing, Nothing, D, Nothing>()
    data class Fifth<E>(val value: E) : Either5<Nothing, Nothing, Nothing, Nothing, E>()

    inline fun <reified T> getAs(): T? = when (this) {
        is First -> value as? T
        is Second -> value as? T
        is Third -> value as? T
        is Fourth -> value as? T
        is Fifth -> value as? T
    }
}

sealed class Either6<out A, out B, out C, out D, out E, out F> {
    data class First<A>(val value: A) : Either6<A, Nothing, Nothing, Nothing, Nothing, Nothing>()
    data class Second<B>(val value: B) : Either6<Nothing, B, Nothing, Nothing, Nothing, Nothing>()
    data class Third<C>(val value: C) : Either6<Nothing, Nothing, C, Nothing, Nothing, Nothing>()
    data class Fourth<D>(val value: D) : Either6<Nothing, Nothing, Nothing, D, Nothing, Nothing>()
    data class Fifth<E>(val value: E) : Either6<Nothing, Nothing, Nothing, Nothing, E, Nothing>()
    data class Sixth<F>(val value: F) : Either6<Nothing, Nothing, Nothing, Nothing, Nothing, F>()

    inline fun <reified T> getAs(): T? = when (this) {
        is First -> value as? T
        is Second -> value as? T
        is Third -> value as? T
        is Fourth -> value as? T
        is Fifth -> value as? T
        is Sixth -> value as? T
    }
}

sealed class Either7<out A, out B, out C, out D, out E, out F, out G> {
  data class First<A>(val value: A) : Either7<A, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing>()
  data class Second<B>(val value: B) : Either7<Nothing, B, Nothing, Nothing, Nothing, Nothing, Nothing>()
  data class Third<C>(val value: C) : Either7<Nothing, Nothing, C, Nothing, Nothing, Nothing, Nothing>()
  data class Fourth<D>(val value: D) : Either7<Nothing, Nothing, Nothing, D, Nothing, Nothing, Nothing>()
  data class Fifth<E>(val value: E) : Either7<Nothing, Nothing, Nothing, Nothing, E, Nothing, Nothing>()
  data class Sixth<F>(val value: F) : Either7<Nothing, Nothing, Nothing, Nothing, Nothing, F, Nothing>()
  data class Seventh<G>(val value: G) : Either7<Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, G>()

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

sealed class Either8<out A, out B, out C, out D, out E, out F, out G, out H> {
  data class First<A>(val value: A) : Either8<A, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing>()
  data class Second<B>(val value: B) : Either8<Nothing, B, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing>()
  data class Third<C>(val value: C) : Either8<Nothing, Nothing, C, Nothing, Nothing, Nothing, Nothing, Nothing>()
  data class Fourth<D>(val value: D) : Either8<Nothing, Nothing, Nothing, D, Nothing, Nothing, Nothing, Nothing>()
  data class Fifth<E>(val value: E) : Either8<Nothing, Nothing, Nothing, Nothing, E, Nothing, Nothing, Nothing>()
  data class Sixth<F>(val value: F) : Either8<Nothing, Nothing, Nothing, Nothing, Nothing, F, Nothing, Nothing>()
  data class Seventh<G>(val value: G) : Either8<Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, G, Nothing>()
  data class Eighth<H>(val value: H) : Either8<Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, H>()

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

sealed class Either9<out A, out B, out C, out D, out E, out F, out G, out H, out I> {
  data class First<A>(val value: A) : Either9<A, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing>()
  data class Second<B>(val value: B) : Either9<Nothing, B, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing>()
  data class Third<C>(val value: C) : Either9<Nothing, Nothing, C, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing>()
  data class Fourth<D>(val value: D) : Either9<Nothing, Nothing, Nothing, D, Nothing, Nothing, Nothing, Nothing, Nothing>()
  data class Fifth<E>(val value: E) : Either9<Nothing, Nothing, Nothing, Nothing, E, Nothing, Nothing, Nothing, Nothing>()
  data class Sixth<F>(val value: F) : Either9<Nothing, Nothing, Nothing, Nothing, Nothing, F, Nothing, Nothing, Nothing>()
  data class Seventh<G>(val value: G) : Either9<Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, G, Nothing, Nothing>()
  data class Eighth<H>(val value: H) : Either9<Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, H, Nothing>()
  data class Ninth<I>(val value: I) : Either9<Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, I>()

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
