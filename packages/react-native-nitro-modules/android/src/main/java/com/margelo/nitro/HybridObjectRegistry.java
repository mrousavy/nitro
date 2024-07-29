package com.margelo.nitro;

import android.util.Log;

import java.util.function.Supplier;

/**
 * A registry that holds initializers for HybridObjects.
 * This will be used to initialize them from JS using `NitroModules.get<T>(name)`.
 * @noinspection JavaJniMissingFunction
 */
public class HybridObjectRegistry {
    /**
     * Registers the given HybridObject in the `HybridObjectRegistry`.
     * It will be uniquely identified via it's `hybridObjectName`, and can be initialized from
     * JS using `NitroModules.get<T>(name)` - which will call the `constructorFn` here.
     */
    public static native void registerHybridObjectConstructor(String hybridObjectName, Supplier<HybridObject> constructorFn);

    private static final String TAG = "HybridObjectRegistry";
    static {
        Log.i(TAG, "Loading native NitroModules C++ library...");
        try {
            System.loadLibrary("NitroModules");
            Log.i(TAG, "Successfully loaded native NitroModules C++ library!");
        } catch (Throwable e) {
            Log.e(TAG, "Failed to load native NitroModules C++ library!", e);
        }
    }
}
