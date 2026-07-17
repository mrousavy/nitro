package com.margelo.nitro.test

import android.util.Log
import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.core.Promise
import java.util.concurrent.CompletableFuture
import java.util.concurrent.ExecutionException
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.TimeoutException

@Keep
@DoNotStrip
class HybridIssue1439 : HybridIssue1439Spec() {

  /**
   * Single-threaded executor pool — mirrors the `IdlingScheduledThreadPoolExecutor`
   * used in JavaHybridAbtMobileClientSDK.java.
   */
  private val executor = Executors.newSingleThreadExecutor { r ->
    Thread(r, "issue1439-pool-thread-0").also { it.isDaemon = true }
  }

  /**
   * Reproduces https://github.com/mrousavy/nitro/issues/1439
   *
   * Uses the EXACT pattern from JavaHybridAbtMobileClientSDK.java (lines 627–641):
   *   - A thread-pool executor (not a coroutine)
   *   - `call.await(new CustomContinuation<>(future))` from Java
   *   - `future.get()` blocking wait
   *
   * Root cause: when `Promise.await(continuation)` is called from Java/non-coroutine Kotlin
   * and the Promise is *already resolved*, Kotlin's `SafeContinuation` returns the value
   * directly from `await()` — without ever invoking `CustomContinuation.resumeWith()`.
   * The Java caller ignores the return value and calls `future.get()` which blocks forever.
   *
   * This happens because the inner Promise (for the second `fn` invocation) can already be
   * resolved by the time we call `await()` on it, depending on JS thread scheduling.
   */
  override fun callFnTwiceFirstThrows(params: Issue1439Params): Promise<String> {
    val outerPromise = Promise<String>()

    executor.submit {
      try {
        // First invocation — expected to throw
        try {
          val result = callFnBlockingJavaStyle(params.fn, Issue1439CallInput("first"))
          Log.w(TAG, "First call unexpectedly succeeded with: $result")
        } catch (e: Exception) {
          Log.d(TAG, "First call threw as expected: ${e.message}")
        }

        // Second invocation — should return "second" but hangs when inner Promise is
        // already resolved and SafeContinuation returns the value without calling
        // CustomContinuation.resumeWith(), leaving future2 incomplete.
        Log.d(TAG, "Starting second invocation...")
        val result = callFnBlockingJavaStyle(params.fn, Issue1439CallInput("second"))
        Log.d(TAG, "Second call returned: $result")
        outerPromise.resolve(result)
      } catch (e: TimeoutException) {
        val msg = "Issue #1439: second fn invocation timed out — " +
          "SafeContinuation swallowed the resume, CompletableFuture.get() blocks forever"
        Log.e(TAG, msg)
        outerPromise.reject(RuntimeException(msg, e))
      } catch (e: Exception) {
        Log.e(TAG, "callFnTwiceFirstThrows failed: ${e.message}", e)
        outerPromise.reject(e)
      }
    }

    return outerPromise
  }

  /**
   * Faithfully mirrors JavaHybridAbtMobileClientSDK.java lines 627–641.
   *
   * The critical path that triggers the bug:
   *
   * ```java
   * Promise<Promise<String>> call = fn.invoke(input);
   *
   * CompletableFuture<Promise<String>> future1 = new CompletableFuture<>();
   * call.await(new CustomContinuation<>(future1));   // ← Java calling a Kotlin suspend fun
   * Promise<String> inner = future1.get();           // blocks until JS dispatched
   *
   * CompletableFuture<String> future2 = new CompletableFuture<>();
   * inner.await(new CustomContinuation<>(future2));  // ← BUG: if inner already resolved,
   *                                                  //   SafeContinuation returns value directly,
   *                                                  //   CustomContinuation.resumeWith never called
   * String result = future2.get();                   // ← hangs forever
   * ```
   *
   * Called from Kotlin via [JavaCallHelper] to stay on the same raw thread.
   */
  @Throws(Exception::class)
  private fun callFnBlockingJavaStyle(
    fn: (input: Issue1439CallInput) -> Promise<Promise<String>>,
    input: Issue1439CallInput,
  ): String {
    val call: Promise<Promise<String>> = fn(input)
    return JavaCallHelper.awaitFnBlocking(call, TIMEOUT_SECONDS, TimeUnit.SECONDS)
  }

  companion object {
    private const val TAG = "HybridIssue1439"
    private const val TIMEOUT_SECONDS = 3L
  }
}

