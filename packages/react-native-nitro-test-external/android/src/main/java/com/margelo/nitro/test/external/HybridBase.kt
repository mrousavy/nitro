package com.margelo.nitro.test.external

import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip

@Keep
@DoNotStrip
class HybridBase : HybridBaseSpec() {
  override val abc: Double = 10.0
}
