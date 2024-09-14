//
// Created by Marc Rousavy on 21.02.24.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
template <typename T, typename Enable>
struct JSIConverter;
} // namespace margelo::nitro

#include "JSIConverter.hpp"
#include <fbjni/fbjni.h>
#include <jni.h>
#include <jsi/jsi.h>

namespace margelo::nitro {

using namespace facebook;

// string <> JString
template <>
struct JSIConverter<jni::JString> final {
  static inline jni::local_ref<jni::JString> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    // TODO: Construct JString more efficiently by avoiding std::string and instead using char*.
    //       JSI needs to add an API for that though!
    return jni::make_jstring(arg.asString(runtime).utf8(runtime));
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, const jni::alias_ref<jni::JString>& arg) {
    JNIEnv* env = jni::Environment::current();
    size_t length = env->GetStringLength(arg.get());
    const char* nativeString = env->GetStringUTFChars(arg.get(), JNI_FALSE);
    return jsi::String::createFromUtf8(runtime, reinterpret_cast<const uint8_t*>(nativeString), length);
  }
  static inline bool canConvert(jsi::Runtime&, const jsi::Value& value) {
    return value.isString();
  }
};

} // namespace margelo::nitro
