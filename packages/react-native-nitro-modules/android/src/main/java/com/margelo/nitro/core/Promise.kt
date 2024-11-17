package com.margelo.nitro.core

import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import kotlin.concurrent.thread

/**
 * Represents a Promise that can be passed to JS.
 *
 * Create a new Promise with the following APIs:
 * - [Promise.async]` { ... }` - Creates a new Promise that runs the given suspending function in a Kotlin coroutine scope.
 * - [Promise.parallel]` { ... }` - Creates a new Promise that runs the given code in a parallel Thread.
 * - [Promise.resolved]`(..)` - Creates a new already resolved Promise.
 * - [Promise.rejected]`(..)` - Creates a new already rejected Promise.
 * - [Promise]`()` - Creates a new Promise with fully manual control over the `resolve(..)`/`reject(..)` functions.
 */
@Suppress("KotlinJniMissingFunction")
@Keep
@DoNotStrip
class Promise<T> {
  private val mHybridData: HybridData

  /**
   * Creates a new Promise with fully manual control over the `resolve(..)`/`reject(..)` functions
   */
  init {
    mHybridData = initHybrid()
  }

  /**
   * Resolves the Promise with the given result.
   * Any `onResolved` listeners will be invoked.
   */
  fun resolve(result: T) {
    nativeResolve(result as Any)
  }

  /**
   * Rejects the Promise with the given error.
   * Any `onRejected` listeners will be invoked.
   */
  fun reject(error: Throwable) {
    nativeReject(error.toString())
  }

  // C++ functions
  private external fun nativeResolve(result: Any)
  private external fun nativeReject(error: String)
  private external fun initHybrid(): HybridData

  companion object {
    private val defaultScope = CoroutineScope(Dispatchers.Default)

    /**
     * Creates a new Promise that asynchronously runs the given suspending function [run]
     * on the given coroutine scope [scope].
     *
     * If [scope] is omitted, the [Dispatchers.Default] scope will be used.
     *
     * When the suspending function returns, the Promise gets resolved. If the suspending
     * function throws, the Promise gets rejected.
     */
    fun <T> async(scope: CoroutineScope = defaultScope, run: suspend () -> T): Promise<T> {
      val promise = Promise<T>()
      scope.launch {
        try {
          val result = run()
          promise.resolve(result)
        } catch (e: Throwable) {
          promise.reject(e)
        }
      }
      return promise
    }

    /**
     * Creates a new Promise that runs the given function [run] on a separate
     * Thread.
     *
     * When the function returns, the Promise gets resolved. If the
     * function throws, the Promise gets rejected.
     */
    fun <T> parallel(run: () -> T): Promise<T> {
      val promise = Promise<T>()
      thread {
        try {
          val result = run()
          promise.resolve(result)
        } catch (e: Throwable) {
          promise.reject(e)
        }
      }
      return promise
    }

    /**
     * Creates a new Promise that is already resolved with the given result.
     */
    fun <T> resolved(result: T): Promise<T> {
      return Promise<T>().apply { resolve(result) }
    }

    /**
     * Creates a new Promise that is already rejected with the given error.
     */
    fun <T> rejected(error: Throwable): Promise<T> {
      return Promise<T>().apply { reject(error) }
    }
  }
}
