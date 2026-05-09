package com.margelo.nitro.test.external

import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip

@Keep
@DoNotStrip
class HybridBlaBla : HybridBlaBlaSpec() {
  override var base: HybridBaseSpec? = HybridBase()
}
