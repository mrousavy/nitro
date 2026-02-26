#include <fbjni/fbjni.h>
#include <jni.h>

#include "NitroTestOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::test::initialize(vm, []() {
    // register custom fbjni/JNI bindings, if any.
  });
}
