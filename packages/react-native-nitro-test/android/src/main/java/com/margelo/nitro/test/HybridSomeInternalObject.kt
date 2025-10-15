package com.margelo.nitro.test

import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.test.external.HybridSomeExternalObjectSpec

class HybridSomeInternalObject : HybridSomeExternalObjectSpec() {
    override fun getValue(): String = "This is overridden!"
}
