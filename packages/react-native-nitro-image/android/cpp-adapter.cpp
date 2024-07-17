#include <jni.h>
#include "react-native-nitro-image.hpp"

extern "C"
JNIEXPORT jdouble JNICALL
Java_com_nitro_NitroImage_nativeMultiply(JNIEnv *env, jclass type, jdouble a, jdouble b) {
    return nitro::multiply(a, b);
}
