package com.margelo.nitro.image

class ImageFactory: HybridImageFactorySpec() {
    override fun loadImageFromFile(path: String): HybridImageSpec {
        throw Error("loadImageFromFile(..) is not yet implemented!")
    }

    override fun loadImageFromURL(path: String): HybridImageSpec {
        throw Error("loadImageFromURL(..) is not yet implemented!")
    }

    override fun loadImageFromSystemName(path: String): HybridImageSpec {
        throw Error("loadImageFromSystemName(..) is not yet implemented!")
    }

    override fun bounceBack(image: HybridImageSpec): HybridImageSpec {
        return image
    }

    override val memorySize: ULong
        get() = 5u
}
