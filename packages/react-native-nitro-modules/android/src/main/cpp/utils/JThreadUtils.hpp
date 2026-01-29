//
//  JThreadUtils.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#include "JNativeRunnable.hpp"
#include <fbjni/fbjni.h>
#include <string>

namespace margelo::nitro {

using namespace facebook;

// Bridged to Java
class JThreadUtils : public jni::JavaClass<JThreadUtils> {
public:
  static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/utils/ThreadUtils;";

  static jni::local_ref<jni::JString> getCurrentThreadName() {
    static auto method = javaClassStatic()->getStaticMethod<jni::local_ref<jni::JString>()>("getCurrentThreadName");
    return method(javaClassStatic());
  }
  static void setCurrentThreadName(jni::alias_ref<jni::JString> name) {
    static auto method = javaClassStatic()->getStaticMethod<void(jni::alias_ref<jni::JString>)>("setCurrentThreadName");
    method(javaClassStatic(), name);
  }
  static jboolean isOnUIThread() {
    static auto method = javaClassStatic()->getStaticMethod<jboolean()>("isOnUIThread");
    return method(javaClassStatic());
  }
  static void runOnUIThread(jni::alias_ref<JNativeRunnable::javaobject> runnable) {
    static auto method = javaClassStatic()->getStaticMethod<void(jni::alias_ref<JNativeRunnable::javaobject>)>("runOnUIThread");
    method(javaClassStatic(), runnable);
  }
};

} // namespace margelo::nitro
