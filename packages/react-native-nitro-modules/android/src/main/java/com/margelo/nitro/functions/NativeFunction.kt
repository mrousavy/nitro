@file:Suppress("KotlinJniMissingFunction")

package com.margelo.nitro.functions

class NativeFunction0<R>: Function0<R> {
    external override fun call(): R
}
class NativeFunction1<R, T1>: Function1<R, T1> {
    external override fun call(arg1: T1): R
}
class NativeFunction2<R, T1, T2>: Function2<R, T1, T2> {
    external override fun call(arg1: T1, arg2: T2): R
}
class NativeFunction3<R, T1, T2, T3>: Function3<R, T1, T2, T3> {
    external override fun call(arg1: T1, arg2: T2, arg3: T3): R
}
class NativeFunction4<R, T1, T2, T3, T4>: Function4<R, T1, T2, T3, T4> {
    external override fun call(arg1: T1, arg2: T2, arg3: T3, arg4: T4): R
}
class NativeFunction5<R, T1, T2, T3, T4, T5>: Function5<R, T1, T2, T3, T4, T5> {
    external override fun call(arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5): R
}
class NativeFunction6<R, T1, T2, T3, T4, T5, T6>: Function6<R, T1, T2, T3, T4, T5, T6> {
    external override fun call(arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6): R
}
class NativeFunction7<R, T1, T2, T3, T4, T5, T6, T7>: Function7<R, T1, T2, T3, T4, T5, T6, T7> {
    external override fun call(arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7): R
}
class NativeFunction8<R, T1, T2, T3, T4, T5, T6, T7, T8>: Function8<R, T1, T2, T3, T4, T5, T6, T7, T8> {
    external override fun call(arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8): R
}
class NativeFunction9<R, T1, T2, T3, T4, T5, T6, T7, T8, T9>: Function9<R, T1, T2, T3, T4, T5, T6, T7, T8, T9> {
    external override fun call(arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9): R
}
