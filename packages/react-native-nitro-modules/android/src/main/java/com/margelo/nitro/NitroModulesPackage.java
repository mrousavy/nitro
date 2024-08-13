package com.margelo.nitro;

import android.util.Log;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfoProvider;
import com.facebook.react.TurboReactPackage;

import java.util.HashMap;

public class NitroModulesPackage extends TurboReactPackage {
  private static final String TAG = "NitroModules";
  static {
    try {
      Log.i(TAG, "Loading NitroModules C++ library...");
      System.loadLibrary("NitroModules");
      Log.i(TAG, "Successfully loaded NitroModules C++ library!");
    } catch (Throwable e) {
      Log.e(TAG, "Failed to load NitroModules C++ library! Is it properly installed and linked?", e);
      throw e;
    }
  }

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
}
