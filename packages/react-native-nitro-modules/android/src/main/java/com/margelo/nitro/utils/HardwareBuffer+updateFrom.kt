package com.margelo.nitro.utils

import android.hardware.HardwareBuffer

/**
 * Updates this [[HardwareBuffer]] with the data in the given [[hardwareBuffer]].
 * The given [[hardwareBuffer]] has to have the same description and shape as this [[HardwareBuffer]].
 */
fun HardwareBuffer.updateFrom(hardwareBuffer: HardwareBuffer) {
    HardwareBufferUtils.copyHardwareBuffer(hardwareBuffer, this)
}

