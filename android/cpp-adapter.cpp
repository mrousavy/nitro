#include <jni.h>
#include "react-native-nitro.h"

extern "C"
JNIEXPORT jdouble JNICALL
Java_com_nitro_NitroModule_nativeMultiply(JNIEnv *env, jclass type, jdouble a, jdouble b) {
    return nitro::multiply(a, b);
}
