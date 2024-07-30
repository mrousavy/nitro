/// Entry point for JNI.

#include <jni.h>
#include "JHybridObjectRegistry.hpp"
#include "RegisterNativeNitroModules.hpp"

using namespace margelo::nitro;

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
    // 1. Initialize the Nitro JSI Turbo Module
    RegisterNativeNitroModules::registerNativeNitroModules();

    // 2. Initialize all Java bindings
    JHybridObjectRegistry::registerNatives();

    return JNI_VERSION_1_2;
}
