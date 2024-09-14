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
#include "JArrayBuffer.hpp"
#include <fbjni/fbjni.h>
#include <jni.h>
#include <jsi/jsi.h>

namespace margelo::nitro {

using namespace facebook;

// ArrayBuffer <> JArrayBuffer
template <>
struct JSIConverter<JArrayBuffer::javaobject> final {
  static inline jni::alias_ref<JArrayBuffer::javaobject> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    std::shared_ptr<ArrayBuffer> jsArrayBuffer = JSIConverter<std::shared_ptr<ArrayBuffer>>::fromJSI(runtime, arg);
    return JArrayBuffer::wrap(jsArrayBuffer);
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, const jni::alias_ref<JArrayBuffer::javaobject>& arg) {
    std::shared_ptr<ArrayBuffer> arrayBuffer = arg->cthis()->getArrayBuffer();
    return jsi::ArrayBuffer(runtime, arrayBuffer);
  }
  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    if (!value.isObject()) {
      return false;
    }
    jsi::Object object = value.getObject(runtime);
    return object.isArrayBuffer(runtime);
  }
};

} // namespace margelo::nitro
