package com.margelo.nitro.test.external

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
  override var isCyan: Boolean = false
    set(value) {
      field = value
      val color = if (value) Color.CYAN else Color.BLUE
      view.setBackgroundColor(color)
    }
  override var hasBeenCalled: Boolean = false
  override var testCallback: () -> Unit = {}

  // Methods
  override fun testMethod() {
    hasBeenCalled = true
    testCallback()
  }
}
