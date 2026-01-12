package com.margelo.nitro.views

import android.view.View
import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.core.HybridObject

/**
 * A base class for all Kotlin-based Hybrid Views.
 */
@Keep
@DoNotStrip
abstract class HybridView<ViewType: View = View> : HybridObject() {
  /**
   * Get the `View` this HybridView is holding.
   *
   * This value should not change during the lifetime of this `HybridView`.
   */
  @get:DoNotStrip
  @get:Keep
  abstract val view: ViewType

  /**
   * Called right before updating props.
   * React props are updated in a single batch/transaction.
   */
  open fun beforeUpdate() { /* noop */ }

  /**
   * Called right after updating props.
   * React props are updated in a single batch/transaction.
   */
  open fun afterUpdate() { /* noop */ }
}
