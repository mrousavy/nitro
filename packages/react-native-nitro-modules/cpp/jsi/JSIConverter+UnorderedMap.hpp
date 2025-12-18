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

#include "AnyMap.hpp"
#include "JSIHelpers.hpp"
#include "PropNameIDCache.hpp"
#include <jsi/jsi.h>
#include <unordered_map>

namespace margelo::nitro {

using namespace facebook;

// std::unordered_map<std::string, T> <> Record<string, T>
template <typename ValueType>
struct JSIConverter<std::unordered_map<std::string, ValueType>> final {
  static inline std::unordered_map<std::string, ValueType> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    jsi::Object object = arg.asObject(runtime);
    jsi::Array propertyNames = object.getPropertyNames(runtime);
    size_t length = propertyNames.size(runtime);

    std::unordered_map<std::string, ValueType> map;
    map.reserve(length);
    for (size_t i = 0; i < length; ++i) {
      std::string key = propertyNames.getValueAtIndex(runtime, i).asString(runtime).utf8(runtime);
      jsi::Value value = object.getProperty(runtime, PropNameIDCache::get(runtime, key));
      map.emplace(key, JSIConverter<ValueType>::fromJSI(runtime, value));
    }
    return map;
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, const std::unordered_map<std::string, ValueType>& map) {
    jsi::Object object(runtime);
    for (const auto& pair : map) {
      jsi::Value value = JSIConverter<ValueType>::toJSI(runtime, pair.second);
      object.setProperty(runtime, pair.first.c_str(), std::move(value));
    }
    return object;
  }

  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    if (!value.isObject()) {
      return false;
    }
    jsi::Object object = value.getObject(runtime);
    if (!isPlainObject(runtime, object)) {
      return false;
    }
    jsi::Array properties = object.getPropertyNames(runtime);
    size_t size = properties.size(runtime);
    for (size_t i = 0; i < size; i++) {
      bool canConvertProp = JSIConverter<ValueType>::canConvert(runtime, properties.getValueAtIndex(runtime, i));
      if (!canConvertProp) {
        return false;
      }
    }
    return true;
  }
};

} // namespace margelo::nitro
