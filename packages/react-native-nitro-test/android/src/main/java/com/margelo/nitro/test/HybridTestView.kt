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
  private var onDropViewCount = 0.0
  private var isBlueSetterCallCount = 0.0
  private var nativeDefaultValueSetterCallCount = 0.0
  private var beforeUpdateCount = 0.0
  private var afterUpdateCount = 0.0

  // Props
  override var isBlue: Boolean = false
    set(value) {
      field = value
      isBlueSetterCallCount += 1
      val color = if (value) Color.BLUE else Color.RED
      view.setBackgroundColor(color)
    }
  override var hasBeenCalled: Boolean = false
  override var colorScheme: ColorScheme = ColorScheme.LIGHT
  override var someCallback: () -> Unit = {}
  override var nativeDefaultValue: Double? = 42.0
    set(value) {
      field = value
      nativeDefaultValueSetterCallCount += 1
    }

  // Methods
  override fun getOnDropViewCount(): Double = onDropViewCount

  override fun getIsBlueSetterCallCount(): Double = isBlueSetterCallCount

  override fun getNativeDefaultValueSetterCallCount(): Double = nativeDefaultValueSetterCallCount

  override fun getBeforeUpdateCount(): Double = beforeUpdateCount

  override fun getAfterUpdateCount(): Double = afterUpdateCount

  override fun beforeUpdate() {
    beforeUpdateCount += 1
  }

  override fun afterUpdate() {
    afterUpdateCount += 1
  }

  override fun someMethod() {
    hasBeenCalled = true
    someCallback()
  }

  override fun onDropView() {
    onDropViewCount += 1
  }
}
