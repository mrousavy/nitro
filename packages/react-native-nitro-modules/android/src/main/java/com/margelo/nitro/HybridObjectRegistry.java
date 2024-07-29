package com.margelo.nitro;

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
    static native void registerHybridObjectConstructor(String hybridObjectName, Supplier<HybridObject> constructorFn);
}
