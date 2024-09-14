package com.margelo.nitro.core

import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.jni.NativeRunnable
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
@Suppress("JoinDeclarationAndAssignment")
@Keep
@DoNotStrip
class Promise<T> {
  private val onResolvedListeners: ArrayList<(T) -> Unit>
  private val onRejectedListeners: ArrayList<(String) -> Unit>
  private var result: T? = null
  private var error: String? = null

  /**
   * Creates a new Promise with fully manual control over the `resolve(..)`/`reject(..)` functions
   */
  init {
    onResolvedListeners = arrayListOf()
    onRejectedListeners = arrayListOf()
  }

  /**
   * Resolves the Promise with the given result.
   * Any `onResolved` listeners will be invoked.
   */
  fun resolve(result: T) {
    this.result = result
    onResolvedListeners.forEach { listener -> listener(result) }
  }

  /**
   * Rejects the Promise with the given error.
   * Any `onRejected` listeners will be invoked.
   */
  fun reject(error: String) {
    this.error = error
    onRejectedListeners.forEach { listener -> listener(error) }
  }

  /**
   * Rejects the Promise with the given error.
   * Any `onRejected` listeners will be invoked.
   */
  fun reject(error: Error) {
    reject(error.toString())
  }

  /**
   * Add a listener that will be called when this Promise will be resolved.
   * If this Promise is already resolved, [listener] will be called immediately.
   */
  fun addOnResolvedListener(listener: (T) -> Unit) {
    if (this.result != null) {
      listener(this.result!!)
    } else {
      onResolvedListeners.add(listener)
    }
  }

  /**
   * Add a listener that will be called when this Promise will be rejected.
   * If this Promise is already rejected, [listener] will be called immediately.
   */
  fun addOnRejectedListener(listener: (String) -> Unit) {
    if (this.error != null) {
      listener(this.error.toString())
    } else {
      onRejectedListeners.add(listener)
    }
  }

  @Keep
  @DoNotStrip
  private fun addOnResolvedListener(listener: NativeFunction<T>) {
    this.addOnResolvedListener { value -> listener.invoke(value) }
  }

  @Keep
  @DoNotStrip
  private fun addOnRejectedListener(listener: NativeFunction<String>) {
    this.addOnRejectedListener { value -> listener.invoke(value) }
  }

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
        } catch (e: Error) {
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
        } catch (e: Error) {
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
    fun <T> rejected(error: Error): Promise<T> {
      return Promise<T>().apply { reject(error) }
    }
  }
}
