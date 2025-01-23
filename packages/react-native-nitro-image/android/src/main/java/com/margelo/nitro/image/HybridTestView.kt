package com.margelo.nitro.image

import android.graphics.Color
import android.view.View
import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.NitroModules

@Keep
@DoNotStrip
class HybridTestView: HybridTestViewSpec() {
    // View
    override val view: View = View(NitroModules.applicationContext)

    // Props
    private var _someProp = false
    override var someProp: Boolean
        get() = _someProp
        set(value) {
            _someProp = value
            val color = if (value) Color.RED else Color.BLUE
            view.setBackgroundColor(color)
        }

    override var someCallback: (someParam: Double) -> Unit = {}

    override fun someFunc(someParam: Double): Boolean {
        return someProp
    }

}
