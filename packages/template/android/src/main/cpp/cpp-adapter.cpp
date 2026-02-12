#include "$$androidCxxLibName$$OnLoad.hpp"
#include <jni.h>

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::$$androidNamespace$$::initialize(vm);
}
