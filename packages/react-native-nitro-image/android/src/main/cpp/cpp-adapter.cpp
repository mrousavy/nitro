#include <jni.h>

#include "JFunc_void_std__string.hpp"
#include "JHybridImageFactorySpec.hpp"
#include "JHybridImageSpec.hpp"

#include "HybridTestObject.hpp"
#include <NitroModules/HybridObjectRegistry.hpp>

using namespace margelo::nitro::image;

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  JFunc_void_std__string::registerNatives();
  JHybridImageSpec::registerNatives();
  JHybridImageFactorySpec::registerNatives();

  HybridObjectRegistry::registerHybridObjectConstructor(
      "TestObject", []() -> std::shared_ptr<HybridObject> { return std::make_shared<HybridTestObject>(); });

  return JNI_VERSION_1_2;
}
