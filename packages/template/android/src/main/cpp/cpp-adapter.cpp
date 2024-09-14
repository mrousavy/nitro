#include <jni.h>

#include "JFunc_void_Person.hpp"
#include "JFunc_void_std__string.hpp"
#include "JHybridKotlinTestObjectSpec.hpp"

#include "HybridTestObject.hpp"
#include <NitroModules/HybridObjectRegistry.hpp>
#include <fbjni/fbjni.h>

using namespace margelo::nitro::<<androidCxxLibName>>;

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return facebook::jni::initialize(vm, [] {
    // TODO: Register JNI natives here

    // TODO: Register C++ turbo modules here
  });
}
