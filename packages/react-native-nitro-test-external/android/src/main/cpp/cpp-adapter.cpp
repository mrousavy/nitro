#include <jni.h>
#include "NitroTestExternalOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::nitrotestexternal::initialize(vm);
}
