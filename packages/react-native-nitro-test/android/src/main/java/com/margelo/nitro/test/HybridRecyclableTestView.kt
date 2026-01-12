package com.margelo.nitro.test

import android.graphics.Color
import android.view.View
import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.uimanager.ThemedReactContext
import com.margelo.nitro.views.RecyclableView

@Keep
@DoNotStrip
class HybridRecyclableTestView(
  val context: ThemedReactContext,
) : HybridRecyclableTestViewSpec(),
  RecyclableView {
  // View
  override val view: View = View(context)
  private var isRecycled = false

  // Props
  override var isBlue: Boolean = false
    set(value) {
      field = value
      if (!isRecycled) {
        val color = if (value) Color.BLUE else Color.RED
        view.setBackgroundColor(color)
      }
    }

  // Recycling conformance
  override fun prepareForRecycle() {
    view.setBackgroundColor(Color.YELLOW)
    isRecycled = true
  }
}
