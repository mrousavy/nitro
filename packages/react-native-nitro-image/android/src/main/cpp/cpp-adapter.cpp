#include <jni.h>

#include "JFunc_void_Person.hpp"
#include "JFunc_void_std__string.hpp"
#include "JHybridImageFactorySpec.hpp"
#include "JHybridImageSpec.hpp"
#include "JHybridKotlinTestObjectSpec.hpp"

#include "HybridTestObject.hpp"
#include <NitroModules/HybridObjectRegistry.hpp>
#include <fbjni/fbjni.h>

using namespace margelo::nitro::image;

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return facebook::jni::initialize(vm, [] {
    // TODO: Do this automatically in our nitrogen'd specs
    // 1. Initialize all JNI Hybrid classes
    JFunc_void_std__string::registerNatives();
    JHybridImageSpec::registerNatives();
    JHybridImageFactorySpec::registerNatives();
    JHybridKotlinTestObjectSpec::registerNatives();
    JFunc_void_Person::registerNatives();

    // 2. Register any custom C++ only HybridObjects manually
    HybridObjectRegistry::registerHybridObjectConstructor(
        "TestObject", []() -> std::shared_ptr<HybridObject> { return std::make_shared<HybridTestObject>(); });
  });
}
