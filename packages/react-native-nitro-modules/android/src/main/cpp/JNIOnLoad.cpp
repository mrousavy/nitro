/// Entry point for JNI.

#include "JAnyMap.hpp"
#include "JAnyValue.hpp"
#include "JArrayBuffer.hpp"
#include "JNitroModules.hpp"
#include "JPromise.hpp"
#include "JVariant.hpp"
#include <fbjni/fbjni.h>
#include <jni.h>

using namespace margelo::nitro;

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return facebook::jni::initialize(vm, [] {
    // 1. Initialize all core Nitro Java bindings
    JArrayBuffer::registerNatives();
    JAnyMap::registerNatives();
    JAnyValue::registerNatives();
    JPromise::registerNatives();
    JVariant2::registerNatives();
    JVariant3::registerNatives();
    JVariant4::registerNatives();
    JVariant5::registerNatives();

    // 2. Initialize the React Native TurboModule C++ part
    JNitroModules::registerNatives();
  });
}
