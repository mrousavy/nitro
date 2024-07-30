#include <jni.h>

#include "JFunc_void_std__string.hpp"
#include "JHybridImage.hpp"
#include "JHybridImageFactory.hpp"

using namespace margelo::nitro::image;

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
    JFunc_void_std__string::registerNatives();
    JHybridImage::registerNatives();
    JHybridImageFactory::registerNatives();

    return JNI_VERSION_1_2;
}
