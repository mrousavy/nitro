package com.margelo.nitro.core

import com.facebook.proguard.annotations.DoNotStrip

@DoNotStrip
sealed class Variant2<out A, out B> {
    @DoNotStrip
    data class First<A>(val value: A) : Variant2<A, Nothing>()
    @DoNotStrip
    data class Second<B>(val value: B) : Variant2<Nothing, B>()

    @DoNotStrip
    inline fun <reified T> getAs(): T? = when (this) {
        is First -> value as? T
        is Second -> value as? T
    }
}

@DoNotStrip
sealed class Variant3<out A, out B, out C> {
    @DoNotStrip
    data class First<A>(val value: A) : Variant3<A, Nothing, Nothing>()
    @DoNotStrip
    data class Second<B>(val value: B) : Variant3<Nothing, B, Nothing>()
    @DoNotStrip
    data class Third<C>(val value: C) : Variant3<Nothing, Nothing, C>()

    inline fun <reified T> getAs(): T? = when (this) {
        is First -> value as? T
        is Second -> value as? T
        is Third -> value as? T
    }
}

@DoNotStrip
sealed class Variant4<out A, out B, out C, out D> {
    @DoNotStrip
    data class First<A>(val value: A) : Variant4<A, Nothing, Nothing, Nothing>()
    @DoNotStrip
    data class Second<B>(val value: B) : Variant4<Nothing, B, Nothing, Nothing>()
    @DoNotStrip
    data class Third<C>(val value: C) : Variant4<Nothing, Nothing, C, Nothing>()
    @DoNotStrip
    data class Fourth<D>(val value: D) : Variant4<Nothing, Nothing, Nothing, D>()

    @DoNotStrip
    inline fun <reified T> getAs(): T? = when (this) {
        is First -> value as? T
        is Second -> value as? T
        is Third -> value as? T
        is Fourth -> value as? T
    }
}

@DoNotStrip
sealed class Variant5<out A, out B, out C, out D, out E> {
    @DoNotStrip
    data class First<A>(val value: A) : Variant5<A, Nothing, Nothing, Nothing, Nothing>()
    @DoNotStrip
    data class Second<B>(val value: B) : Variant5<Nothing, B, Nothing, Nothing, Nothing>()
    @DoNotStrip
    data class Third<C>(val value: C) : Variant5<Nothing, Nothing, C, Nothing, Nothing>()
    @DoNotStrip
    data class Fourth<D>(val value: D) : Variant5<Nothing, Nothing, Nothing, D, Nothing>()
    @DoNotStrip
    data class Fifth<E>(val value: E) : Variant5<Nothing, Nothing, Nothing, Nothing, E>()

    @DoNotStrip
    inline fun <reified T> getAs(): T? = when (this) {
        is First -> value as? T
        is Second -> value as? T
        is Third -> value as? T
        is Fourth -> value as? T
        is Fifth -> value as? T
    }
}

@DoNotStrip
sealed class Variant6<out A, out B, out C, out D, out E, out F> {
    @DoNotStrip
    data class First<A>(val value: A) : Variant6<A, Nothing, Nothing, Nothing, Nothing, Nothing>()
    @DoNotStrip
    data class Second<B>(val value: B) : Variant6<Nothing, B, Nothing, Nothing, Nothing, Nothing>()
    @DoNotStrip
    data class Third<C>(val value: C) : Variant6<Nothing, Nothing, C, Nothing, Nothing, Nothing>()
    @DoNotStrip
    data class Fourth<D>(val value: D) : Variant6<Nothing, Nothing, Nothing, D, Nothing, Nothing>()
    @DoNotStrip
    data class Fifth<E>(val value: E) : Variant6<Nothing, Nothing, Nothing, Nothing, E, Nothing>()
    @DoNotStrip
    data class Sixth<F>(val value: F) : Variant6<Nothing, Nothing, Nothing, Nothing, Nothing, F>()

    @DoNotStrip
    inline fun <reified T> getAs(): T? = when (this) {
        is First -> value as? T
        is Second -> value as? T
        is Third -> value as? T
        is Fourth -> value as? T
        is Fifth -> value as? T
        is Sixth -> value as? T
    }
}

@DoNotStrip
sealed class Variant7<out A, out B, out C, out D, out E, out F, out G> {
    @DoNotStrip
    data class First<A>(val value: A) :
        Variant7<A, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing>()
    @DoNotStrip
    data class Second<B>(val value: B) :
        Variant7<Nothing, B, Nothing, Nothing, Nothing, Nothing, Nothing>()
    @DoNotStrip
    data class Third<C>(val value: C) :
        Variant7<Nothing, Nothing, C, Nothing, Nothing, Nothing, Nothing>()
    @DoNotStrip
    data class Fourth<D>(val value: D) :
        Variant7<Nothing, Nothing, Nothing, D, Nothing, Nothing, Nothing>()
    @DoNotStrip
    data class Fifth<E>(val value: E) :
        Variant7<Nothing, Nothing, Nothing, Nothing, E, Nothing, Nothing>()
    @DoNotStrip
    data class Sixth<F>(val value: F) :
        Variant7<Nothing, Nothing, Nothing, Nothing, Nothing, F, Nothing>()
    @DoNotStrip
    data class Seventh<G>(val value: G) :
        Variant7<Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, G>()

    @DoNotStrip
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

@DoNotStrip
sealed class Variant8<out A, out B, out C, out D, out E, out F, out G, out H> {
    @DoNotStrip
    data class First<A>(val value: A) :
        Variant8<A, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing>()
    @DoNotStrip
    data class Second<B>(val value: B) :
        Variant8<Nothing, B, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing>()
    @DoNotStrip
    data class Third<C>(val value: C) :
        Variant8<Nothing, Nothing, C, Nothing, Nothing, Nothing, Nothing, Nothing>()
    @DoNotStrip
    data class Fourth<D>(val value: D) :
        Variant8<Nothing, Nothing, Nothing, D, Nothing, Nothing, Nothing, Nothing>()
    @DoNotStrip
    data class Fifth<E>(val value: E) :
        Variant8<Nothing, Nothing, Nothing, Nothing, E, Nothing, Nothing, Nothing>()
    @DoNotStrip
    data class Sixth<F>(val value: F) :
        Variant8<Nothing, Nothing, Nothing, Nothing, Nothing, F, Nothing, Nothing>()
    @DoNotStrip
    data class Seventh<G>(val value: G) :
        Variant8<Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, G, Nothing>()
    @DoNotStrip
    data class Eighth<H>(val value: H) :
        Variant8<Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, H>()

    @DoNotStrip
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

@DoNotStrip
sealed class Variant9<out A, out B, out C, out D, out E, out F, out G, out H, out I> {
    @DoNotStrip
    data class First<A>(val value: A) :
        Variant9<A, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing>()
    @DoNotStrip
    data class Second<B>(val value: B) :
        Variant9<Nothing, B, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing>()
    @DoNotStrip
    data class Third<C>(val value: C) :
        Variant9<Nothing, Nothing, C, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing>()
    @DoNotStrip
    data class Fourth<D>(val value: D) :
        Variant9<Nothing, Nothing, Nothing, D, Nothing, Nothing, Nothing, Nothing, Nothing>()
    @DoNotStrip
    data class Fifth<E>(val value: E) :
        Variant9<Nothing, Nothing, Nothing, Nothing, E, Nothing, Nothing, Nothing, Nothing>()
    @DoNotStrip
    data class Sixth<F>(val value: F) :
        Variant9<Nothing, Nothing, Nothing, Nothing, Nothing, F, Nothing, Nothing, Nothing>()
    @DoNotStrip
    data class Seventh<G>(val value: G) :
        Variant9<Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, G, Nothing, Nothing>()
    @DoNotStrip
    data class Eighth<H>(val value: H) :
        Variant9<Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, H, Nothing>()
    @DoNotStrip
    data class Ninth<I>(val value: I) :
        Variant9<Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, Nothing, I>()

    @DoNotStrip
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
