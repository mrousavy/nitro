package com.margelo.nitro.image;

import android.util.Log;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfoProvider;
import com.facebook.react.TurboReactPackage;
import com.margelo.nitro.HybridObject;
import com.margelo.nitro.HybridObjectRegistry;

import java.util.HashMap;
import java.util.function.Supplier;

public class NitroImagePackage extends TurboReactPackage {
  @Nullable
  @Override
  public NativeModule getModule(String name, ReactApplicationContext reactContext) {
    return null;
  }

  public NitroImagePackage() {
    HybridObjectRegistry.registerHybridObjectConstructor("ImageFactory", () -> {
      Log.i("YEET", "initializing ImageFactory...");
      ImageFactory f = new ImageFactory();
      Log.i("YEET", "done ImageFactory!");
      return f;
    });
    HybridObjectRegistry.registerHybridObjectConstructor("KotlinTestObject", KotlinTestObject::new);
  }

  @Override
  public ReactModuleInfoProvider getReactModuleInfoProvider() {
    return () -> {
        return new HashMap<>();
    };
  }
}
