package com.margelo.nitro;

import androidx.annotation.NonNull;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.util.Map;
import java.util.HashMap;
import com.margelo.nitro.NativeNitroOnLoadSpec;

public class NativeNitroOnLoadModule extends NativeNitroOnLoadSpec {
  public static String NAME = "NativeNitroOnLoad";

    public NativeNitroOnLoadModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

    @Override
    public void init() {
        // This is a dummy method to test the initialization of the native module
    }
}
