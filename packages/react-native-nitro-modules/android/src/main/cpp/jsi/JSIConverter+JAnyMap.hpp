//
// Created by Marc Rousavy on 21.02.24.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
template <typename T, typename Enable>
struct JSIConverter;
} // namespace margelo::nitro

#include "AnyMap.hpp"
#include "JAnyMap.hpp"
#include "JSIConverter.hpp"
#include <fbjni/fbjni.h>
#include <jni.h>
#include <jsi/jsi.h>

namespace margelo::nitro {

using namespace facebook;

// {} <> JAnyMap
template <>
struct JSIConverter<JAnyMap::javaobject> final {
  static inline jni::alias_ref<JAnyMap::javaobject> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    // TODO: Stay within Java's data structures to convert AnyMap more efficiently.
    auto anyMap = JSIConverter<std::shared_ptr<AnyMap>>::fromJSI(runtime, arg);
    return JAnyMap::create(anyMap);
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, const jni::alias_ref<JAnyMap::javaobject>& arg) {
    // TODO: Stay within Java's data structures to convert AnyMap more efficiently.
    auto anyMap = arg->cthis()->getMap();
    return JSIConverter<std::shared_ptr<AnyMap>>::toJSI(runtime, anyMap);
  }
  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    return JSIConverter<std::shared_ptr<AnyMap>>::canConvert(runtime, value);
  }
};

} // namespace margelo::nitro
