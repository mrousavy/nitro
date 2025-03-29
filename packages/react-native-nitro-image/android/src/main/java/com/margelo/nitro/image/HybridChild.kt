package com.margelo.nitro.image

import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip

@Keep
@DoNotStrip
class HybridChild: HybridChildSpec() {
    override val baseValue: Double
        get() = 20.0
    override val childValue: Double
        get() = 30.0
}
