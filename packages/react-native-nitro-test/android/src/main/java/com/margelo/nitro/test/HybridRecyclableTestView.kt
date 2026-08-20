package com.margelo.nitro.test

import android.graphics.Color
import android.util.Log
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
  private var invalidLifecycleOrderCount = 0.0
  private var onDropViewCount = 0.0
  private var prepareForRecycleCount = 0.0
  private var nativeDefaultValueSetterCallCount = 0.0
  private var nativeDefaultValueStorage: Double? = 42.0

  // Props
  override var isBlue: Boolean = false
    set(value) {
      field = value
      if (!isRecycled) {
        val color = if (value) Color.BLUE else Color.RED
        view.setBackgroundColor(color)
      }
    }
  override var nativeDefaultValue: Double?
    get() = nativeDefaultValueStorage
    set(value) {
      nativeDefaultValueStorage = value
      nativeDefaultValueSetterCallCount += 1
    }

  override fun onDropView() {
    onDropViewCount += 1
    Log.i(TAG, "View dropped!")
  }

  override fun getOnDropViewCount(): Double = onDropViewCount

  override fun getInvalidLifecycleOrderCount(): Double = invalidLifecycleOrderCount

  override fun getPrepareForRecycleCount(): Double = prepareForRecycleCount

  override fun getNativeDefaultValueSetterCallCount(): Double = nativeDefaultValueSetterCallCount

  override fun beforeUpdate() {
    isRecycled = false
  }

  // Recycling conformance
  override fun prepareForRecycle() {
    if (onDropViewCount != prepareForRecycleCount + 1) {
      invalidLifecycleOrderCount += 1
    }
    prepareForRecycleCount += 1
    nativeDefaultValueStorage = 42.0
    nativeDefaultValueSetterCallCount = 0.0
    view.setBackgroundColor(Color.YELLOW)
    isRecycled = true
  }
}
