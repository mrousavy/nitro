#include <jni.h>

#include "JFunc_void_std__string.hpp"
#include "JHybridImage.hpp"
#include "JHybridImageFactory.hpp"

#include "HybridTestImpl.hpp"
#include <NitroModules/HybridObjectRegistry.hpp>

using namespace margelo::nitro::image;

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
    JFunc_void_std__string::registerNatives();
    JHybridImage::registerNatives();
    JHybridImageFactory::registerNatives();

    HybridObjectRegistry::registerHybridObjectConstructor("TestObject", []() -> std::shared_ptr<HybridObject> {
        return std::make_shared<HybridTestObjectImpl>();
    });

    return JNI_VERSION_1_2;
}
