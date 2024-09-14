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

// {} <> JMap
template <typename K, typename V>
struct JSIConverter<jni::JMap<K, V>> final {
  static inline jni::local_ref<jni::JMap<K, V>> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    jsi::Object object = arg.asObject(runtime);
    jsi::Array propertyNames = object.getPropertyNames(runtime);
    size_t size = propertyNames.size(runtime);
    jni::local_ref<jni::JHashMap<K, V>> map = jni::JHashMap<K, V>::create(size);
    for (size_t i = 0; i < size; i++) {
      jsi::Value key = propertyNames.getValueAtIndex(runtime, i);
      jsi::Value value = object.getProperty(runtime, key.asString(runtime));
      map->put(JSIConverter<K>::fromJSI(runtime, key), JSIConverter<V>::fromJSI(runtime, value));
    }
    return map;
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, jni::local_ref<jni::JMap<K, V>> arg) {
    jsi::Object object = jsi::Object(runtime);
    size_t size = arg->size();
    for (const auto& entry : *arg) {
      jsi::String key = jsi::String::createFromUtf8(runtime, entry.first->toStdString());
      object.setProperty(runtime, key, JSIConverter<V>::toJSI(runtime, entry.second));
    }
    return object;
  }
  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    if (!value.isObject()) {
      return false;
    }
    jsi::Object object = value.getObject(runtime);
    return isPlainObject(runtime, object);
  }
};

} // namespace margelo::nitro
