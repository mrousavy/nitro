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
    private var _isBlue = false
    override var isBlue: Boolean
        get() = _isBlue
        set(value) {
            _isBlue = value
            val color = if (value) Color.BLUE else Color.RED
            view.setBackgroundColor(color)
            view.requestLayout()
        }
}
