package com.margelo.nitro.image;

import com.facebook.jni.annotations.DoNotStrip;
import com.facebook.react.fabric.StateWrapperImpl;
import com.facebook.react.uimanager.StateWrapper;

@DoNotStrip
public class ValueFromStateWrapper {
    @DoNotStrip
    public static native Object valueFromStateWrapper(StateWrapperImpl stateWrapper);
}
