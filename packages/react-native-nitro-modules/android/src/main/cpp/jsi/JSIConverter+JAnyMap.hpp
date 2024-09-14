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
#include "JSIConverter+JObject.hpp"
#include <fbjni/fbjni.h>
#include <jni.h>
#include <jsi/jsi.h>

namespace margelo::nitro {

using namespace facebook;

// {} <> JAnyMap
template <>
struct JSIConverter<JAnyMap::javaobject> final {
  static inline jni::local_ref<JAnyMap::javaobject> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    jsi::Object object = arg.asObject(runtime);
    jsi::Array properties = object.getPropertyNames(runtime);
    size_t size = properties.size(runtime);

    jni::local_ref<JAnyMap::javaobject> map = JAnyMap::create(size);
    jni::alias_ref<jni::JMap<jni::JString, jni::JObject>> javaMap = map->cthis()->getJavaMap();
    for (size_t i = 0; i < size; i++) {
        jsi::String prop = properties.getValueAtIndex(runtime, i).asString(runtime);
        jsi::Value value = object.getProperty(runtime, prop);
        javaMap->put(/* key */ jni::make_jstring(prop.utf8(runtime)),
                     /* value */ JSIConverter<jni::JObject>::fromJSI(runtime, value));
    }

    return map;
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, const jni::alias_ref<JAnyMap::javaobject>& arg) {
    jsi::Object object(runtime);
    auto map = arg->cthis()->getJavaMap();
    for (const auto& entry : *map) {
        jsi::String key = JSIConverter<jni::JString>::toJSI(runtime, entry.first).getString(runtime);
        jni::alias_ref<jni::JObject> value = entry.second;

        object.setProperty(runtime, key, JSIConverter<jni::JObject>::toJSI(runtime, value));
    }
    return object;
  }
  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    if (!value.isObject()) return false;
    jsi::Object object = value.getObject(runtime);
    return isPlainObject(runtime, object);
  }
};

} // namespace margelo::nitro
