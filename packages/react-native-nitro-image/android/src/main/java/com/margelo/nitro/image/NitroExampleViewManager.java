package com.margelo.nitro.image;

import android.util.Log;
import android.view.View;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.fabric.StateWrapperImpl;
import com.facebook.react.uimanager.ReactStylesDiffMap;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.StateWrapper;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.bridge.ReadableNativeMap;

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

    @Nullable
    @Override
    public Object updateState(@NonNull View view, ReactStylesDiffMap props, StateWrapper stateWrapper) {
        StateWrapperImpl stateWrapperImpl = (StateWrapperImpl) stateWrapper;

        // TODO: i am sure there is a way to make this casting a bit better
//        HybridTestObjectKotlin nativeProp = ValueFromStateWrapper.getNativeProp(stateWrapper, "nativeProp", HybridTestObjectKotlin.class);
        Object nativeProp = ValueFromStateWrapper.valueFromStateWrapper(stateWrapperImpl);
        HybridTestObjectKotlin casted = (HybridTestObjectKotlin) nativeProp;
        long value = casted.getBigintValue();
        Log.d("NitroExampleViewManager", "Value from state: " + value);

        // TODO: @Marc - here we could call a method that the user has to implement for the prop update

        return super.updateState(view, props, stateWrapper);
    }
}
