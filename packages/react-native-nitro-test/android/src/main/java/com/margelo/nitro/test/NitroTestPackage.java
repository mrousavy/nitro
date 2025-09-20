package com.margelo.nitro.test;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfoProvider;
import com.facebook.react.TurboReactPackage;
import com.facebook.react.uimanager.ViewManager;
import com.margelo.nitro.test.views.HybridTestViewManager;
import com.margelo.nitro.test.views.HybridViewWithChildrenManager;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class NitroTestPackage extends TurboReactPackage {
  @Nullable
  @Override
  public NativeModule getModule(String name, ReactApplicationContext reactContext) {
    return null;
  }

  @Override
  public ReactModuleInfoProvider getReactModuleInfoProvider() {
    return () -> {
        return new HashMap<>();
    };
  }

  @Override
  public List<ViewManager> createViewManagers(@NonNull ReactApplicationContext reactContext) {
    List<ViewManager> viewManagers = new ArrayList<>();
    viewManagers.add(new HybridTestViewManager());
    viewManagers.add(new HybridViewWithChildrenManager());
    return viewManagers;
  }

  static {
    NitroTestOnLoad.initializeNative();
  }
}
