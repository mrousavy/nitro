package com.margelo.nitro.image

class ImageFactory: HybridImageFactory() {
    override fun loadImageFromFile(path: String): HybridImage {
        throw Error("loadImageFromFile(..) is not yet implemented!")
    }

    override fun loadImageFromURL(path: String): HybridImage {
        throw Error("loadImageFromURL(..) is not yet implemented!")
    }

    override fun loadImageFromSystemName(path: String): HybridImage {
        throw Error("loadImageFromSystemName(..) is not yet implemented!")
    }

    override fun bounceBack(image: HybridImage): HybridImage {
        return image
    }

    override val memorySize: ULong
        get() = 5u
}