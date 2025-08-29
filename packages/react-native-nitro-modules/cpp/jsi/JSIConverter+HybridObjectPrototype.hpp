//
// Created by Marc Rousavy on 29.08.25.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
struct HybridObjectPrototype;
template <typename T, typename Enable>
struct JSIConverter;
} // namespace margelo::nitro

#include "JSIConverter.hpp"

#include <jsi/jsi.h>
#include <memory>
#include "HybridObjectPrototype.hpp"

namespace margelo::nitro {

using namespace facebook;

// HybridObjectPrototype <> {}
template <>
struct JSIConverter<HybridObjectPrototype> final {
  static inline HybridObjectPrototype fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    throw std::runtime_error("HybridObjectPrototype cannot be converted from a jsi::Value!");
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, HybridObjectPrototype& proto) {
    return proto.toJSI(runtime);
  }
  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    return false;
  }
};

} // namespace margelo::nitro
