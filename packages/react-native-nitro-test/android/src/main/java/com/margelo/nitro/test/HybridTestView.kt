package com.margelo.nitro.test

import android.graphics.Color
import android.view.View
import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.uimanager.ThemedReactContext

@Keep
@DoNotStrip
class HybridTestView(
  val context: ThemedReactContext,
) : HybridTestViewSpec() {
  // View
  override val view: View = View(context)

  // Props
  override var isBlue: Boolean = false
    set(value) {
      field = value
      val color = if (value) Color.BLUE else Color.RED
      view.setBackgroundColor(color)
    }
  override var hasBeenCalled: Boolean = false
  override var colorScheme: ColorScheme = ColorScheme.LIGHT
  override var someCallback: () -> Unit = {}

  // Methods
  override fun someMethod() {
    hasBeenCalled = true
    someCallback()
  }
}
