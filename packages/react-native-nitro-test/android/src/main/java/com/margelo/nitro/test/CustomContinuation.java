package com.margelo.nitro.test;

import org.jetbrains.annotations.NotNull;

import java.util.concurrent.CompletableFuture;

import kotlin.ResultKt;
import kotlin.coroutines.Continuation;
import kotlin.coroutines.CoroutineContext;
import kotlin.coroutines.EmptyCoroutineContext;

/**
 * Bridges a Kotlin {@code Continuation<T>} to a Java {@link CompletableFuture}.
 *
 * <p>This is the <em>exact</em> pattern used in
 * {@code JavaHybridAbtMobileClientSDK.java} (lines 627–641) that triggers
 * https://github.com/mrousavy/nitro/issues/1439.</p>
 *
 * <p><strong>The bug:</strong> when the Kotlin {@code suspend fun await()} is called
 * from Java with this continuation, and the {@code Promise} is <em>already resolved</em>
 * by the time {@code await()} is called, Kotlin's {@code SafeContinuation} short-circuits:
 * it returns the value directly from {@code await()} instead of calling
 * {@link #resumeWith}. The Java caller ignores that return value, calls
 * {@link CompletableFuture#get()}, and <strong>blocks forever</strong> because
 * {@link #resumeWith} was never invoked.</p>
 */
public class CustomContinuation<T> implements Continuation<T> {

    private final CompletableFuture<T> future;

    public CustomContinuation(CompletableFuture<T> future) {
        this.future = future;
    }

    @NotNull
    @Override
    public CoroutineContext getContext() {
        return EmptyCoroutineContext.INSTANCE;
    }

    /**
     * Called by Kotlin's coroutine machinery when the {@code Promise} resolves or
     * rejects <em>asynchronously</em> (i.e. after {@code await()} returned
     * {@code COROUTINE_SUSPENDED}).
     *
     * <p><em>Not</em> called when the Promise is already settled at the time
     * {@code await()} is invoked — that is the root of the issue.</p>
     */
    @Override
    public void resumeWith(@NotNull Object result) {
        try {
            ResultKt.throwOnFailure(result);
            //noinspection unchecked
            future.complete((T) result);
        } catch (Throwable t) {
            future.completeExceptionally(t);
        }
    }
}
