package com.margelo.nitro.core

import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip
import dalvik.annotation.optimization.FastNative
import java.nio.ByteBuffer

/**
 * An ArrayBuffer instance shared between native (Kotlin/C++) and JS.
 *
 * A `ByteBuffer` will be used as the underlying `ArrayBuffer`'s data,
 * which has to remain valid for as long as the `ArrayBuffer` is alive.
 */
@Suppress("KotlinJniMissingFunction")
@Keep
@DoNotStrip
class ArrayBuffer {
    /**
     * Holds the native C++ instance of the `ArrayBuffer`.
     */
    private val mHybridData: HybridData

    /**
     * Whether this `ArrayBuffer` is an **owning-**, or a **non-owning-** `ArrayBuffer`.
     * - **Owning** ArrayBuffers can safely be held in memory for longer, and accessed at any point.
     * - **Non-owning** ArrayBuffers can not be held in memory for longer, and can only be safely
     * accessed within the synchronous function's scope (aka on the JS Thread). Once you switch Threads,
     * data access is not safe anymore. If you need to access data longer, copy the data.
     */
    val isOwner: Boolean
        get() = getIsOwner()

    /**
     * Whether this `ArrayBuffer` is holding a `ByteBuffer`, or not.
     * - If the `ArrayBuffer` holds a `ByteBuffer`, `getBuffer(false)` can safely be called to
     * get shared access to the underlying data, without performing any copies.
     * - If the `ArrayBuffer` doesn't hold a `ByteBuffer`, it can still be accessed via `getBuffer(false)`,
     * but the returned `ByteBuffer` is only valid as long as it's parent `ArrayBuffer` is alive.
     */
    val isByteBuffer: Boolean
        get() = getIsByteBuffer()

    /**
     * Get the size of bytes in this `ArrayBuffer`.
     */
    val size: Int
        get() = getBufferSize()

    /**
     * Get a `ByteBuffer` that holds- or wraps- the underlying data.
     * - If this `ArrayBuffer` has been created from Kotlin/Java, it is already holding a
     * `ByteBuffer` (`isByteBuffer == true`). In this case, the returned buffer is safe to access,
     * even after the `ArrayBuffer` has already been destroyed in JS.
     * - If this `ArrayBuffer` has been created elsewhere (C++/JS), it is not holding a
     * `ByteBuffer` (`isByteBuffer == false`). In this case, the returned buffer will either be a copy
     * of the data (`copyIfNeeded == true`), or just wrapping the data (`copyIfNeeded == false`).
     *
     * @param copyIfNeeded If this `ArrayBuffer` is not holding a `ByteBuffer` (`isByteBuffer == false`),
     * the foreign data needs to be either _wrapped_, or _copied_ to be represented as a `ByteBuffer`.
     * This flag controls that behaviour.
     */
    fun getBuffer(copyIfNeeded: Boolean): ByteBuffer {
        return getByteBuffer(copyIfNeeded)
    }

    /**
     * Create a new **owning-** `ArrayBuffer` that holds the given `ByteBuffer`.
     * The `ByteBuffer` needs to remain valid for as long as the `ArrayBuffer` is alive.
     */
    constructor(byteBuffer: ByteBuffer) {
        if (!byteBuffer.isDirect) {
            throw Error("ArrayBuffers can only be created from direct ByteBuffers, " +
                    "and the given ByteBuffer is not direct!")
        }
        mHybridData = initHybrid(byteBuffer)
    }

    /**
     * Create a new **non-owning-** `ArrayBuffer` that holds foreign data, potentially coming from JS.
     */
    @Suppress("unused")
    @Keep
    @DoNotStrip
    private constructor(hybridData: HybridData) {
        mHybridData = hybridData
    }

    private external fun initHybrid(buffer: ByteBuffer): HybridData
    private external fun getByteBuffer(copyIfNeeded: Boolean): ByteBuffer
    @FastNative
    private external fun getIsOwner(): Boolean
    @FastNative
    private external fun getIsByteBuffer(): Boolean
    @FastNative
    private external fun getBufferSize(): Int

    companion object {
        /**
         * Allocate a new `ArrayBuffer` with the given [size].
         */
        fun allocate(size: Int): ArrayBuffer {
            val buffer = ByteBuffer.allocateDirect(size)
            return ArrayBuffer(buffer)
        }

        /**
         * Copy the given `ArrayBuffer` into a new **owning** `ArrayBuffer`.
         */
        fun copyOf(other: ArrayBuffer): ArrayBuffer {
            // 1. Create a new buffer with the same size as the other
            val newBuffer = ByteBuffer.allocateDirect(other.size)
            // 2. Prepare the source buffer
            val originalBuffer = other.getBuffer(false)
            originalBuffer.rewind()
            // 3. Copy over the source buffer into the new buffer
            newBuffer.put(originalBuffer)
            // 4. Rewind both buffers again to index 0
            newBuffer.rewind()
            originalBuffer.rewind()
            // 5. Create a new `ArrayBuffer`
            return ArrayBuffer(newBuffer)
        }
    }
}
