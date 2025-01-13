package com.margelo.nitro.core;

import androidx.annotation.Keep;

import com.facebook.proguard.annotations.DoNotStrip;

/**
 * @deprecated HybridObjects should be registered from C++ instead. Either autolink them using `nitro.json`, or add them manually in the C++ `HybridObjectRegistry`.
 */
@Keep
@DoNotStrip
@Deprecated(forRemoval = true)
public interface HybridObjectInitializer {
    @Keep
    @DoNotStrip
    HybridObject initialize();
}
