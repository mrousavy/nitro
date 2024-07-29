package com.margelo.nitro.image

class Image: HybridImage() {
    override val size: ImageSize
        get() = TODO("Not yet implemented")
    override val pixelFormat: PixelFormat
        get() = TODO("Not yet implemented")
    override var someSettableProp: Double
        get() = TODO("Not yet implemented")
        set(value) {}

    override fun toArrayBuffer(format: ImageFormat): Double {
        TODO("Not yet implemented")
    }

    override fun saveToFile(path: String, onFinished: Func_void_std__string) {
        TODO("Not yet implemented")
    }

    override val memorySize: ULong
        get() = TODO("Not yet implemented")
}