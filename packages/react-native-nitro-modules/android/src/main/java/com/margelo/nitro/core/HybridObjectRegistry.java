package com.margelo.nitro.core;

import androidx.annotation.Keep;
import com.facebook.proguard.annotations.DoNotStrip;
import com.margelo.nitro.JNIOnLoad;

/**
 * A registry that holds initializers for HybridObjects.
 * This will be used to initialize them from JS using `NitroModules.createHybridObject<T>(name)`.
 * @noinspection JavaJniMissingFunction
 */
@Keep
@DoNotStrip
public class HybridObjectRegistry {
    static {
        JNIOnLoad.initializeNativeNitro();
    }

    /**
     * Registers the given HybridObject in the `HybridObjectRegistry`.
     * It will be uniquely identified via it's `hybridObjectName`, and can be initialized from
     * JS using `NitroModules.createHybridObject<T>(name)` - which will call the `constructorFn` here.
     * @deprecated HybridObjects should be registered from C++ instead. Either autolink them using `nitro.json`, or add them manually in HybridObjectRegistry.
     */
    @Deprecated(forRemoval = true)
    public static native void registerHybridObjectConstructor(String hybridObjectName, HybridObjectInitializer initializer);
}
