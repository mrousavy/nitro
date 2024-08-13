#include <jni.h>

#include "JCallback_void_std__string.hpp"
#include "JHybridImage.hpp"
#include "JHybridImageFactory.hpp"

#include "HybridTestObject.hpp"
#include <NitroModules/HybridObjectRegistry.hpp>

using namespace margelo::nitro::image;

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  JCallback_void_std__string::registerNatives();
  JHybridImage::registerNatives();
  JHybridImageFactory::registerNatives();

  HybridObjectRegistry::registerHybridObjectConstructor(
      "TestObject", []() -> std::shared_ptr<HybridObject> { return std::make_shared<HybridTestObject>(); });

  return JNI_VERSION_1_2;
}
