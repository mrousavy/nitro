//
// Created by Marc Rousavy on 10.11.25.
//

#pragma once

// Forward declare JSIConverter to prevent cyclic includes
namespace margelo::nitro {
template <typename T, typename Enable>
struct JSIConverter;
} // namespace margelo::nitro

#include "JSIConverter.hpp"
#include "Null.hpp"
#include <jsi/jsi.h>

namespace margelo::nitro {

using namespace facebook;

// NullType <> null
template <>
struct JSIConverter<NullType> final {
  static inline NullType fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    if (!arg.isNull()) [[unlikely]] {
      throw std::runtime_error("Cannot convert non-null value to NullType!");
    }
    return nitro::null;
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, const NullType& value) {
    return jsi::Value::null();
  }
  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    return value.isNull();
  }
};

} // namespace margelo::nitro
