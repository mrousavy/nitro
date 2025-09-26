package com.margelo.nitro.test;

import android.content.Context
import android.graphics.Color
import androidx.annotation.Keep;
import com.facebook.proguard.annotations.DoNotStrip;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.views.view.ReactViewGroup


class ViewWithChildrenImpl(context: Context) : ReactViewGroup(context) {}

@Keep
@DoNotStrip
class HybridViewWithChildren(val context: ThemedReactContext): HybridViewWithChildrenSpec() {
    // View
    override val view = ViewWithChildrenImpl(context)

    // Props
    override var colorScheme: ColorScheme = ColorScheme.LIGHT
    override var someCallback: () -> Unit = {}

    // Methods
    override fun someMethod(): Unit {
        someCallback()
    }
}