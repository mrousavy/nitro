package com.margelo.nitro.image;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfoProvider;
import com.facebook.react.TurboReactPackage;
import com.margelo.nitro.HybridObjectRegistry;

import java.util.HashMap;

public class NitroImagePackage extends TurboReactPackage {
  @Nullable
  @Override
  public NativeModule getModule(String name, ReactApplicationContext reactContext) {
    return null;
  }

  public NitroImagePackage() {
    HybridObjectRegistry.registerHybridObjectConstructor("ImageFactory", ImageFactory::new);
  }

  @Override
  public ReactModuleInfoProvider getReactModuleInfoProvider() {
    return () -> {
        return new HashMap<>();
    };
  }
}
