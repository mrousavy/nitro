/// Entry point for JNI.

#include "JAnyMap.hpp"
#include "JArrayBuffer.hpp"
#include "JHybridObjectRegistry.hpp"
#include "JPromise.hpp"
#include "RegisterNativeNitroModules.hpp"
#include <fbjni/fbjni.h>
#include <jni.h>

using namespace margelo::nitro;

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return facebook::jni::initialize(vm, [] {
    // 1. Initialize the Nitro JSI Turbo Module
    RegisterNativeNitroModules::registerNativeNitroModules();

    // 2. Initialize all Java bindings
    JHybridObjectRegistry::registerNatives();
    JArrayBuffer::registerNatives();
    JAnyMap::registerNatives();
    JPromise::registerNatives();
  });
}
