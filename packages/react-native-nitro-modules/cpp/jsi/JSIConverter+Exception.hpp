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

#include <jsi/jsi.h>
#include <exception>
#include "TypeInfo.hpp"

namespace margelo::nitro {

using namespace facebook;

// std::exception <> Error
template<>
struct JSIConverter<std::exception> final {
  static inline std::exception fromJSI(jsi::Runtime& runtime, const jsi::Value& error) {
    jsi::Object object = error.asObject(runtime);
    std::string name = object.getProperty(runtime, "name").asString(runtime).utf8(runtime);
    std::string message = object.getProperty(runtime, "message").asString(runtime).utf8(runtime);
    return std::runtime_error(name + ": " + message);
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, const std::exception& exception) {
    jsi::JSError error(runtime, exception.what());
    return jsi::Value(runtime, error.value());
  }
  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    if (!value.isObject()) {
      return false;
    }
    jsi::Object object = value.getObject(runtime);
    return object.hasProperty(runtime, "name") && object.hasProperty(runtime, "message");
  }
};

} // namespace margelo::nitro
