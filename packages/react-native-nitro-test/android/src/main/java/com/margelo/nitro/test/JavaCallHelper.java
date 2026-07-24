package com.margelo.nitro.test;

import com.margelo.nitro.core.Promise;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * Java helper that reproduces the exact JavaHybridAbtMobileClientSDK.java pattern
 * (lines 627–641) which triggers https://github.com/mrousavy/nitro/issues/1439.
 *
 * <h2>Why this is in Java</h2>
 * The bug requires calling the Kotlin {@code suspend fun Promise.await()} from Java
 * with a custom {@link CustomContinuation}.  When Kotlin's {@code SafeContinuation}
 * detects that the Promise is <em>already resolved</em>, it returns the result
 * directly from {@code await()} — without ever calling
 * {@link CustomContinuation#resumeWith}.  The Java caller ignores that return value
 * and calls {@link CompletableFuture#get()}, which blocks forever.
 *
 * <h2>The pattern</h2>
 * <pre>{@code
 * Promise<Promise<String>> call = fn.invoke(input);
 *
 * // ─── outer promise ────────────────────────────────────────────────────────
 * CompletableFuture<Promise<String>> future1 = new CompletableFuture<>();
 * call.await(new CustomContinuation<>(future1));   // Java calls Kotlin suspend fun
 * Promise<String> inner = future1.get(timeout);    // blocks until JS dispatches
 *
 * // ─── inner promise ────────────────────────────────────────────────────────
 * CompletableFuture<String> future2 = new CompletableFuture<>();
 * inner.await(new CustomContinuation<>(future2));  // ← BUG: if 'inner' is already
 *                                                  //   resolved, SafeContinuation
 *                                                  //   eats the value; future2
 *                                                  //   is never completed
 * return future2.get(timeout);                     // ← HANGS
 * }</pre>
 */
public class JavaCallHelper {

    /**
     * Calls the given {@code call} Promise using the abt-SDK Java pattern.
     *
     * <p>This method deliberately reproduces the bug: if the inner Promise is
     * already resolved by the time {@code inner.await(continuation)} is called,
     * {@link CompletableFuture#get()} hangs forever (or until {@code timeout}
     * expires with a {@link TimeoutException}).</p>
     *
     * @param call    the outer {@code Promise<Promise<String>>} returned by {@code fn.invoke(input)}
     * @param timeout timeout value passed to each {@link CompletableFuture#get}
     * @param unit    timeout unit
     * @return the resolved string
     * @throws TimeoutException    when the bug is triggered — inner future never completes
     * @throws ExecutionException  when the JS function threw
     * @throws InterruptedException if the waiting thread is interrupted
     */
    @SuppressWarnings("unused")
    public static String awaitFnBlocking(
            Promise<Promise<String>> call,
            long timeout,
            TimeUnit unit
    ) throws Exception {

        // ── Step 1: wait for the JS function to dispatch and return its Promise ──
        CompletableFuture<Promise<String>> future1 = new CompletableFuture<>();
        // Call the Kotlin `suspend fun await()` from Java with a CustomContinuation.
        // When the outer Promise is pending this works correctly: COROUTINE_SUSPENDED is
        // returned, and CustomContinuation.resumeWith() is called later on the JS thread.
        call.await(new CustomContinuation<>(future1));
        Promise<String> inner = unwrap(future1.get(timeout, unit));

        // ── Step 2: wait for the actual string result ──────────────────────────
        CompletableFuture<String> future2 = new CompletableFuture<>();
        // BUG: if 'inner' is already resolved here (race between JS-thread resolution
        // and the executor thread reaching this line), Kotlin's SafeContinuation
        // returns "second" directly from await() without calling
        // CustomContinuation.resumeWith().  future2 is never completed.
        inner.await(new CustomContinuation<>(future2));
        return unwrap(future2.get(timeout, unit)); // ← hangs when bug is triggered
    }

    /**
     * Unwrap {@link ExecutionException} so callers see the original cause.
     */
    @SuppressWarnings("unchecked")
    private static <T> T unwrap(T value) {
        return value; // marker — real unwrapping is done by callers catching ExecutionException
    }
}
