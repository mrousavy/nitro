/// Entry point for JNI.

#include "JAnyMap.hpp"
#include "JAnyValue.hpp"
#include "JArrayBuffer.hpp"
#include "JHybridObjectRegistry.hpp"
#include "JNitroModules.hpp"
#include "JPromise.hpp"
#include <fbjni/fbjni.h>
#include <jni.h>

using namespace margelo::nitro;

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return facebook::jni::initialize(vm, [] {
    // 1. Initialize all core Nitro Java bindings
    JHybridObjectRegistry::registerNatives();
    JArrayBuffer::registerNatives();
    JAnyMap::registerNatives();
    JAnyValue::registerNatives();
    JPromise::registerNatives();

    // 2. Initialize the React Native TurboModule C++ part
    JNitroModules::registerNatives();
  });
}
