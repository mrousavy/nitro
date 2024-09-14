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

// T <> jni::alias_ref<T>
template <typename T>
struct JSIConverter<jni::alias_ref<T>> final {
  static inline jni::alias_ref<T> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    return JSIConverter<T>::fromJSI(runtime, arg);
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, const jni::alias_ref<T>& arg) {
    return JSIConverter<T>::toJSI(runtime, arg);
  }
  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    return JSIConverter<T>::canConvert(runtime, value);
  }
};

// T <> jni::local_ref<T>
template <typename T>
struct JSIConverter<jni::local_ref<T>> final {
  static inline jni::local_ref<T> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    return JSIConverter<T>::fromJSI(runtime, arg);
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, const jni::local_ref<T>& arg) {
    return JSIConverter<T>::toJSI(runtime, arg);
  }
  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    return JSIConverter<T>::canConvert(runtime, value);
  }
};

// T <> jni::global_ref<T>
template <typename T>
struct JSIConverter<jni::global_ref<T>> final {
  static inline jni::global_ref<T> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    return jni::make_global(JSIConverter<T>::fromJSI(runtime, arg));
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, const jni::local_ref<T>& arg) {
    return JSIConverter<T>::toJSI(runtime, arg);
  }
  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    return JSIConverter<T>::canConvert(runtime, value);
  }
};

} // namespace margelo::nitro
