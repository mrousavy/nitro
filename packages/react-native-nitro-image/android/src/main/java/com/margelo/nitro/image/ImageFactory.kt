package com.margelo.nitro.image

class ImageFactory: HybridImageFactory() {
    override fun loadImageFromFile(path: String): HybridImage {
        TODO("Not yet implemented")
    }

    override fun loadImageFromURL(path: String): HybridImage {
        TODO("Not yet implemented")
    }

    override fun loadImageFromSystemName(path: String): HybridImage {
        TODO("Not yet implemented")
    }

    override fun bounceBack(image: HybridImage): HybridImage {
        TODO("Not yet implemented")
    }

    override val memorySize: ULong
        get() = 0u
}