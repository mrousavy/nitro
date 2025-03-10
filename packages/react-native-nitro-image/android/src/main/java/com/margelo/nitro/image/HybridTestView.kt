package com.margelo.nitro.image

import android.graphics.Color
import android.view.View
import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.uimanager.ThemedReactContext

@Keep
@DoNotStrip
class HybridTestView(val context: ThemedReactContext): HybridTestViewSpec() {
    // View
    override val view: View = View(context)

    // Props
    private var _isBlue = false
    override var isBlue: Boolean
        get() = _isBlue
        set(value) {
            _isBlue = value
            val color = if (value) Color.BLUE else Color.RED
            view.setBackgroundColor(color)
        }
    override colorScheme: ColorScheme = ColorScheme.LIGHT
    override var someCallback: () -> Unit = {}

    // Methods
    override fun someMethod(): Unit {
        someCallback()
    }
}
