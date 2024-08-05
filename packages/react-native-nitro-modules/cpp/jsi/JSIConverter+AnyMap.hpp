//
// Created by Marc Rousavy on 21.02.24.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
class AnyMap;

template <typename T, typename Enable>
struct JSIConverter;
} // namespace margelo::nitro

#include "JSIConverter.hpp"

#include "AnyMap.hpp"
#include <jsi/jsi.h>
#include <memory>

namespace margelo::nitro {

using namespace facebook;

// AnyValue <> Record<K, V>
template <>
struct JSIConverter<AnyValue> {
  static inline AnyValue fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    return JSIConverter<AnyValue::variant>::fromJSI(runtime, arg);
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, const AnyValue& value) {
    return JSIConverter<std::variant<AnyValue::variant>>::toJSI(runtime, value);
  }
};

// AnyMap <> Record<K, V>
template <>
struct JSIConverter<std::shared_ptr<AnyMap>> {
  static inline std::shared_ptr<AnyMap> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    jsi::Object object = arg.asObject(runtime);
    jsi::Array propNames = object.getPropertyNames(runtime);
    size_t size = propNames.size(runtime);
    std::shared_ptr<AnyMap> map = AnyMap::make();
    for (size_t i = 0; i < size; i++) {
      jsi::String jsKey = propNames.getValueAtIndex(runtime, i).getString(runtime);
      jsi::Value jsValue = object.getProperty(runtime, jsKey);
      map->setAny(jsKey.utf8(runtime), JSIConverter<AnyValue>::fromJSI(runtime, jsValue));
    }
    return map;
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, std::shared_ptr<AnyMap> map) {
    jsi::Object object(runtime);
    for (const auto& item : map->getMap()) {
      jsi::String key = jsi::String::createFromUtf8(runtime, item.first);
      jsi::Value value = JSIConverter<AnyValue>::toJSI(runtime, item.second);
      object.setProperty(runtime, std::move(key), std::move(value));
    }
    return object;
  }
};

} // namespace margelo::nitro
