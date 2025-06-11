package com.margelo.nitro.core

import androidx.annotation.Keep
import android.hardware.HardwareBuffer
import android.os.Build
import androidx.annotation.RequiresApi
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.utils.HardwareBufferUtils
import dalvik.annotation.optimization.FastNative
import java.nio.ByteBuffer

// AHardwareBuffer* needs to be boxed in jobject*
typealias BoxedHardwareBuffer = Any

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
     * Whether this `ArrayBuffer` is holding a `HardwareBuffer`, or not.
     * - If the `ArrayBuffer` holds a `HardwareBuffer`, `getHardwareBuffer()` can safely be called without copy.
     * - If the `ArrayBuffer` doesn't hold a `HardwareBuffer`, `getHardwareBuffer()` will throw.
     * You will need to call `getByteBuffer(copyIfNeeded)` instead.
     */
    val isHardwareBuffer: Boolean
        get() = getIsHardwareBuffer()

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
     * Get the underlying `HardwareBuffer` if this `ArrayBuffer` was created with one.
     * @throws Error if this `ArrayBuffer` was not created with a `HardwareBuffer`.
     */
    @RequiresApi(Build.VERSION_CODES.O)
    fun getHardwareBuffer(): HardwareBuffer {
        val boxed = getHardwareBufferBoxed()
        return boxed as HardwareBuffer
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
     * Create a new **owning-** `ArrayBuffer` that holds the given `HardwareBuffer`.
     * The `HardwareBuffer` needs to remain valid for as long as the `ArrayBuffer` is alive.
     */
    @RequiresApi(Build.VERSION_CODES.O)
    constructor(hardwareBuffer: HardwareBuffer) {
        if (hardwareBuffer.isClosed) {
            throw Error("Cannot create ArrayBuffer from an already-closed HardwareBuffer!")
        }
        mHybridData = initHybridBoxedHardwareBuffer(hardwareBuffer)
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
    @RequiresApi(Build.VERSION_CODES.O)
    private external fun initHybridBoxedHardwareBuffer(hardwareBufferBoxed: BoxedHardwareBuffer): HybridData

    private external fun getByteBuffer(copyIfNeeded: Boolean): ByteBuffer
    private external fun getHardwareBufferBoxed(): BoxedHardwareBuffer

    @FastNative
    private external fun getIsOwner(): Boolean
    @FastNative
    private external fun getIsByteBuffer(): Boolean
    @FastNative
    private external fun getIsHardwareBuffer(): Boolean
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
        fun copy(other: ArrayBuffer): ArrayBuffer {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && other.isHardwareBuffer) {
                val hardwareBuffer = other.getHardwareBuffer()
                return copy(hardwareBuffer)
            } else {
                val byteBuffer = other.getBuffer(false)
                return copy(byteBuffer)
            }
        }

        /**
         * Copy the given `ByteBuffer` into a new **owning** `ArrayBuffer`.
         */
        fun copy(byteBuffer: ByteBuffer): ArrayBuffer {
            // 1. Find out size
            byteBuffer.rewind()
            val size = byteBuffer.remaining()
            // 2. Create a new buffer with the same size as the other
            val newBuffer = ByteBuffer.allocateDirect(size)
            // 3. Copy over the source buffer into the new buffer
            newBuffer.put(byteBuffer)
            // 4. Rewind both buffers again to index 0
            newBuffer.rewind()
            byteBuffer.rewind()
            // 5. Create a new `ArrayBuffer`
            return ArrayBuffer(newBuffer)
        }
        /**
         * Copy the given `HardwareBuffer` into a new **owning** `ArrayBuffer`.
         */
        @RequiresApi(Build.VERSION_CODES.O)
        fun copy(hardwareBuffer: HardwareBuffer): ArrayBuffer {
            val copy = HardwareBufferUtils.copyHardwareBuffer(hardwareBuffer)
            return ArrayBuffer(copy)
        }

        /**
         * Wrap the given `ByteBuffer` in a new **owning** `ArrayBuffer`.
         */
        fun wrap(byteBuffer: ByteBuffer): ArrayBuffer {
            byteBuffer.rewind()
            return ArrayBuffer(byteBuffer)
        }

        /**
         * Wrap the given `HardwareBuffer` in a new **owning** `ArrayBuffer`.
         */
        @RequiresApi(Build.VERSION_CODES.O)
        fun wrap(hardwareBuffer: HardwareBuffer): ArrayBuffer {
            return ArrayBuffer(hardwareBuffer)
        }
    }
}
