package com.margelo.nitro.image

import androidx.annotation.Keep
import android.graphics.Bitmap
import com.facebook.proguard.annotations.DoNotStrip

@Keep
@DoNotStrip
class ImageFactory: HybridImageFactorySpec() {
    override fun loadImageFromFile(path: String): HybridImageSpec {
        return Image(Bitmap.createBitmap(1920, 1080, Bitmap.Config.ARGB_8888))
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

    override val memorySize: Long
        get() = 5
}
