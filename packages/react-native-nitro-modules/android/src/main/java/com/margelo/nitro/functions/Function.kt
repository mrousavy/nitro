package com.margelo.nitro.functions

/**
 * Represents a function (either from JS, C++ or Java/Kotlin), that returns a `R`.
 */
fun interface Function0<R> {
    fun call(): R
}
fun interface Function1<R, T1> {
    fun call(arg1: T1): R
}
fun interface Function2<R, T1, T2> {
    fun call(arg1: T1, arg2: T2): R
}
fun interface Function3<R, T1, T2, T3> {
    fun call(arg1: T1, arg2: T2, arg3: T3): R
}
fun interface Function4<R, T1, T2, T3, T4> {
    fun call(arg1: T1, arg2: T2, arg3: T3, arg4: T4): R
}
fun interface Function5<R, T1, T2, T3, T4, T5> {
    fun call(arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5): R
}
fun interface Function6<R, T1, T2, T3, T4, T5, T6> {
    fun call(arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6): R
}
fun interface Function7<R, T1, T2, T3, T4, T5, T6, T7> {
    fun call(arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7): R
}
fun interface Function8<R, T1, T2, T3, T4, T5, T6, T7, T8> {
    fun call(arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8): R
}
fun interface Function9<R, T1, T2, T3, T4, T5, T6, T7, T8, T9> {
    fun call(arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9): R
}
