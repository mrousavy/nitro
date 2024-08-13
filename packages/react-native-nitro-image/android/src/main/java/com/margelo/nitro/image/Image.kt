package com.margelo.nitro.image

import android.graphics.Bitmap
import android.util.Log

class Image(val bitmap: Bitmap): HybridImage() {
    override val size: ImageSize
        get() {
            return ImageSize(bitmap.width.toDouble(), bitmap.height.toDouble())
        }
    override val pixelFormat: PixelFormat
        get() = PixelFormat.RGB
    override var someSettableProp: Double
        get() = Math.random()
        set(value) {
            Log.i(TAG, "Set value to $value")
        }

    override fun toArrayBuffer(format: ImageFormat): Double {
        TODO("Not yet implemented")
    }

    override fun saveToFile(path: String, onFinished: Func_void_std__string) {
        TODO("Not yet implemented")
    }

    override val memorySize: ULong
        get() = bitmap.allocationByteCount.toULong()
}
