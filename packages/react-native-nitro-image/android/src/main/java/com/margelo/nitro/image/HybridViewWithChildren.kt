package com.margelo.nitro.image;

import android.content.Context
import android.graphics.Color
import androidx.annotation.Keep;
import com.facebook.proguard.annotations.DoNotStrip;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.views.view.ReactViewGroup


/*
 * ViewWithChildrenImpl extends ReactViewGroup so that style properties like flex,
 * justifyContent, alignItems, padding etc.. can be applied.
 * Feel Free to use LinearLayout or any other ViewGroup that suits your needs.
 */
class ViewWithChildrenImpl: ReactViewGroup {
    constructor(context: Context) : super(context)
}

@Keep
@DoNotStrip
class HybridViewWithChildren(val context: ThemedReactContext): HybridViewWithChildrenSpec() {
    // View
    override val view = ReactViewGroup(context)

    // Props
    private var _isBlue = false
    override var isBlue: Boolean
        get() = _isBlue
        set(value) {
            _isBlue = value
            val color = if (value) Color.BLUE else Color.RED
            view.setBackgroundColor(color)
        }
    override var colorScheme: ColorScheme = ColorScheme.LIGHT
    override var someCallback: () -> Unit = {}

    // Methods
    override fun someMethod(): Unit {
        someCallback()
    }
}
