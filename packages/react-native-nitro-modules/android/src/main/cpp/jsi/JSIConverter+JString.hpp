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
    return jni::make_jstring(arg.asString(runtime).utf8(runtime));
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, const jni::local_ref<jni::JString>& arg) {
    return jsi::String::createFromUtf8(runtime, arg->toStdString());
  }
  static inline bool canConvert(jsi::Runtime&, const jsi::Value& value) {
    return value.isString();
  }
};

} // namespace margelo::nitro
