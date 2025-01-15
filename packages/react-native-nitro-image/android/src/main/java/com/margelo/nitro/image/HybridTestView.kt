package com.margelo.nitro.image

import android.view.View
import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.NitroModules

@Keep
@DoNotStrip
class HybridTestView: HybridTestViewSpec() {
    override var someProp: Boolean = false
    override var someCallback: (someParam: Double) -> Unit = {}

    override fun someFunc(someParam: Double): Boolean {
        return someProp
    }

    override val view: View = View(NitroModules.applicationContext)
}
