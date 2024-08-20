package com.margelo.nitro.core;

import androidx.annotation.Keep;

import com.facebook.proguard.annotations.DoNotStrip;

@Keep
@DoNotStrip
public interface HybridObjectInitializer {
    @Keep
    @DoNotStrip
    HybridObject initialize();
}
