package com.margelo.nitro;

import android.util.Log;

public class JNIOnLoad {
    private static final String TAG = "NitroModules";
    private static boolean isInitialized = false;
    public static void initializeNativeNitro() {
        if (isInitialized) return;
        try {
            Log.i(TAG, "Loading NitroModules C++ library...");
            System.loadLibrary("NitroModules");
            Log.i(TAG, "Successfully loaded NitroModules C++ library!");
            isInitialized = true;
        } catch (Throwable e) {
            Log.e(TAG, "Failed to load NitroModules C++ library! Is it properly installed and linked?", e);
            throw e;
        }
    }
}
