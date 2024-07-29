/// Entry point for JNI.

#include <jni.h>
#include "JHybridObjectRegistry.hpp"

using namespace margelo::nitro;

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  JHybridObjectRegistry::registerNatives();
}
