package com.margelo.nitro.views

/** A size returned from [MeasurableView.measureContent]. */
data class Size(
  val width: Double,
  val height: Double,
) {
  companion object {
    val ZERO = Size(0.0, 0.0)
  }
}

/** The layout context a measure pass runs in. */
data class LayoutContext(
  val pointScaleFactor: Double,
  val isRTL: Boolean,
)

/**
 * The size constraints a measure pass must resolve within.
 *
 * A dimension is "at most" when its [maximumSize] component is finite, and
 * "undefined" (intrinsic) when it is [Double.POSITIVE_INFINITY].
 */
data class LayoutConstraints(
  val minimumSize: Size,
  val maximumSize: Size,
)

/**
 * Opt-in for a `HybridView` that computes its own intrinsic size (Text-like
 * auto-height) instead of being laid out purely by its React children / flexbox.
 *
 * Kotlin interfaces cannot require static members, so implement this on the view's
 * **companion object** - the idiomatic equivalent of the Swift `static` requirement:
 *
 * ```kotlin
 * class HybridNitroText(context: Context) : HybridNitroTextSpec() {
 *   companion object : MeasurableView<NitroTextProps> {
 *     override fun measureContent(props: NitroTextProps,
 *                                 layoutContext: LayoutContext,
 *                                 layoutConstraints: LayoutConstraints): Size {
 *       // Measure off the main thread (e.g. StaticLayout) - never touch the View.
 *       return Size(100.0, 50.0)
 *     }
 *   }
 * }
 * ```
 *
 * Conformance is detected at view registration; Nitro then makes this view a
 * measurable Yoga leaf.
 *
 * - Important: [measureContent] runs on the **shadow/layout thread** with no view.
 *   Measure purely from `props` with a thread-safe primitive.
 * - Note: A measurable view is a Yoga **leaf** and cannot host React children.
 */
interface MeasurableView<P> {
  fun measureContent(
    props: P,
    layoutContext: LayoutContext,
    layoutConstraints: LayoutConstraints,
  ): Size
}
