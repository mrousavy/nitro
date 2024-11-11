package com.margelo.nitro.image

import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip

@Keep
@DoNotStrip
class HybridBase: HybridBaseSpec() {
    override val baseValue: Double
        get() = 10.0

    override val memorySize: Long
        get() = 0L
}
