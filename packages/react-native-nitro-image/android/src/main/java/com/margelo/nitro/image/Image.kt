package com.margelo.nitro.image

import android.graphics.Bitmap
import android.os.Handler
import android.os.Looper
import android.util.Log

class Image(val bitmap: Bitmap): HybridImageSpec() {
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

    override fun saveToFile(path: String, onFinished: (String) -> Unit) {
        Handler(Looper.getMainLooper()).postDelayed({
            onFinished(path)
        }, 5000)
    }

    override val memorySize: Long
        get() = bitmap.allocationByteCount.toLong()
}
