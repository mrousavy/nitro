package com.margelo.nitro.test

import android.content.Context
import android.text.StaticLayout
import android.text.TextPaint
import android.util.TypedValue
import android.widget.TextView
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.views.LayoutConstraints
import com.margelo.nitro.views.LayoutContext
import com.margelo.nitro.views.MeasurableView
import com.margelo.nitro.views.Size
import kotlin.math.ceil


@DoNotStrip
class HybridMeasuredView(context: Context) : HybridMeasuredViewSpec() {
  override val view: TextView = TextView(context)

  override var text: String = ""
    set(value) {
      field = value
      view.text = value
    }

  override var fontSize: Double = 17.0
    set(value) {
      field = value
      view.setTextSize(TypedValue.COMPLEX_UNIT_SP, value.toFloat())
    }

  companion object : MeasurableView<MeasuredViewProps> {
    override fun measureContent(
      props: MeasuredViewProps,
      layoutContext: LayoutContext,
      layoutConstraints: LayoutConstraints,
    ): Size {
      val density = layoutContext.pointScaleFactor.toFloat()
      val paint = TextPaint().apply {
        isAntiAlias = true
        textSize = props.fontSize.toFloat() * density
      }
      val maxWidthPx =
        if (layoutConstraints.maximumSize.width.isFinite()) {
          (layoutConstraints.maximumSize.width * density).toInt()
        } else {
          Int.MAX_VALUE
        }
      val layout = StaticLayout.Builder
        .obtain(props.text, 0, props.text.length, paint, maxWidthPx)
        .build()
      var widthPx = 0f
      for (i in 0 until layout.lineCount) {
        widthPx = maxOf(widthPx, layout.getLineWidth(i))
      }

      return Size(
        ceil(widthPx / density).toDouble(),
        ceil(layout.height / density).toDouble(),
      )
    }
  }
}
