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

namespace margelo::nitro {

using namespace facebook;

// std::exception <> Error
struct JSIConverter<std::exception> final {
  static inline std::exception fromJSI(jsi::Runtime& runtime, const jsi::Value& error) {
    // TODO: To exception
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, const std::exception& exception) {
    // TODO: From exception
  }
  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    if (!value.isObject()) {
      return false;
    }
    jsi::Object object = value.getObject(runtime);
    return object.hasProperty(runtime, "message");
  }
};

} // namespace margelo::nitro
