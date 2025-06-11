package com.margelo.nitro.utils

import android.hardware.HardwareBuffer

/**
 * HardwareBuffers are special types in JNI (`AHardwareBuffer*`)
 * and have to be boxed to `jobject*`.
 */
typealias BoxedHardwareBuffer = Any

@Suppress("KotlinJniMissingFunction")
class HardwareBufferUtils {
    companion object {
        @JvmStatic
        private external fun copyHardwareBuffer(sourceHardwareBuffer: BoxedHardwareBuffer): BoxedHardwareBuffer
        @JvmStatic
        private external fun copyHardwareBuffer(sourceHardwareBuffer: BoxedHardwareBuffer, destinationHardwareBuffer: BoxedHardwareBuffer)

        /**
         * Copies the given [[hardwareBuffer]] into a new, identically shaped [[HardwareBuffer]].
         */
        @Throws
        fun copyHardwareBuffer(hardwareBuffer: HardwareBuffer): HardwareBuffer {
            val resultBoxed = copyHardwareBuffer(hardwareBuffer as Any)
            return resultBoxed as HardwareBuffer
        }

        /**
         * Copies the given [[source]] [[HardwareBuffer]] into the given [[destination]] [[HardwareBuffer]].
         */
        @Throws
        fun copyHardwareBuffer(source: HardwareBuffer, destination: HardwareBuffer) {
            copyHardwareBuffer(source as Any, destination as Any)
        }
    }
}
