#include <jni.h>
#include "$$androidCxxLibName$$OnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return facebook::jni::initialize(vm, []() {
    margelo::nitro::$$androidNamespace$$::registerNatives();
  });
}
