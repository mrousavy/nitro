package com.margelo.nitro.utils

import android.os.Handler
import android.os.Looper
import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip

@Suppress("unused")
@Keep
@DoNotStrip
class ThreadUtils {
  companion object {
    private val handler = Handler(Looper.getMainLooper())

    @JvmStatic
    @Keep
    @DoNotStrip
    fun getCurrentThreadName(): String {
      return Thread.currentThread().name
    }

    @JvmStatic
    @Keep
    @DoNotStrip
    fun setCurrentThreadName(name: String) {
      Thread.currentThread().name = name
    }

    @JvmStatic
    @Keep
    @DoNotStrip
    fun isOnUIThread(): Boolean {
      return Looper.myLooper() == Looper.getMainLooper()
    }

    @JvmStatic
    @Keep
    @DoNotStrip
    fun runOnUIThread(runnable: Runnable) {
      handler.post(runnable)
    }

    // Overload taking NativeRunnable so the JNI method lookup in
    // JThreadUtils.hpp (which requests signature
    // `(Lcom/margelo/nitro/utils/NativeRunnable;)V`) resolves. Without this,
    // Promise rejections routed through UIThreadDispatcher crash with
    // NoSuchMethodError on Android at runtime (e.g. async work that rejects
    // a Promise from a background thread).
    @JvmStatic
    @Keep
    @DoNotStrip
    fun runOnUIThread(runnable: NativeRunnable) {
      handler.post(runnable)
    }
  }
}
