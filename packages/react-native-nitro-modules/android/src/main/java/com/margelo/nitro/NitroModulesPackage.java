package com.margelo.nitro;

import android.util.Log;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfo;
import com.facebook.react.module.model.ReactModuleInfoProvider;
import com.facebook.react.TurboReactPackage;
import java.util.Collections;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import com.margelo.nitro.NativeNitroOnLoadModule;

public class NitroModulesPackage extends TurboReactPackage {
  static {
    JNIOnLoad.initializeNativeNitro();
  }

  private static ReactApplicationContext _reactContext;

  public static ReactApplicationContext getReactContext() {
    return _reactContext;
  }

  @Nullable
  @Override
  public NativeModule getModule(String name, ReactApplicationContext reactContext) {
    _reactContext = reactContext;

    if (name.equals(NativeNitroOnLoadModule.NAME)) {
      return new NativeNitroOnLoadModule(reactContext);
    } else {
      return null;
    }
  }

  @Override
  public ReactModuleInfoProvider getReactModuleInfoProvider() {
    return () -> {
      final Map<String, ReactModuleInfo> moduleInfos = new HashMap<>();
      moduleInfos.put(
              NativeNitroOnLoadModule.NAME,
              new ReactModuleInfo(
                NativeNitroOnLoadModule.NAME,
                NativeNitroOnLoadModule.NAME,
                false,
                false,
                true,
                false,
                true
      ));
      return moduleInfos;
    };
  }
}
