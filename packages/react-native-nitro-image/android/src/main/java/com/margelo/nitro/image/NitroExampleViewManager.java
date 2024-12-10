package com.margelo.nitro.image;

import android.view.View;

import androidx.annotation.NonNull;

import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;

public class NitroExampleViewManager extends SimpleViewManager<View> {
    @NonNull
    @Override
    public String getName() {
        return "CustomView";
    }

    @NonNull
    @Override
    protected View createViewInstance(@NonNull ThemedReactContext reactContext) {
        return new View(reactContext);
    }
}
