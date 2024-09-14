//
// Created by Marc Rousavy on 21.02.24.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
template <typename T, typename Enable>
struct JSIConverter;
} // namespace margelo::nitro

#include "JHybridObject.hpp"
#include "JSIConverter.hpp"
#include <fbjni/fbjni.h>
#include <jni.h>
#include <jsi/jsi.h>

namespace margelo::nitro {

using namespace facebook;

// {} <> JHybridObject
template <>
struct JSIConverter<JHybridObject::javaobject> final {
  static inline jni::alias_ref<JHybridObject::javaobject> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    jsi::Object object = arg.asObject(runtime);
    if (!object.hasNativeState<JHybridObject>(runtime)) [[unlikely]] {
      std::string typeDescription = arg.toString(runtime).utf8(runtime);
      throw std::runtime_error("Cannot convert \"" + typeDescription + "\" to JHybridObject! It does not have a NativeState.");
    }
    std::shared_ptr<jsi::NativeState> nativeState = object.getNativeState(runtime);
    std::shared_ptr<JHybridObject> jhybridObject = std::dynamic_pointer_cast<JHybridObject>(nativeState);
    return jhybridObject->getJavaPart();
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, const jni::alias_ref<JHybridObject::javaobject>& arg) {
    return arg->cthis()->toObject(runtime);
  }
  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    if (!value.isObject()) {
      return false;
    }
    jsi::Object object = value.getObject(runtime);
    return object.hasNativeState(runtime);
  }
};

} // namespace margelo::nitro
