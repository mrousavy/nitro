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
#include <jsi/jsi.h>
#include <vector>

namespace margelo::nitro {

using namespace facebook;

// std::vector<T> <> T[]
template <typename ElementType>
struct JSIConverter<std::vector<ElementType>> {
  static inline std::vector<ElementType> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    jsi::Array array = arg.asObject(runtime).asArray(runtime);
    size_t length = array.size(runtime);

    std::vector<ElementType> vector;
    vector.reserve(length);
    for (size_t i = 0; i < length; ++i) {
      jsi::Value elementValue = array.getValueAtIndex(runtime, i);
      vector.emplace_back(JSIConverter<ElementType>::fromJSI(runtime, elementValue));
    }
    return vector;
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, const std::vector<ElementType>& vector) {
    jsi::Array array(runtime, vector.size());
    for (size_t i = 0; i < vector.size(); i++) {
      jsi::Value value = JSIConverter<ElementType>::toJSI(runtime, vector[i]);
      array.setValueAtIndex(runtime, i, std::move(value));
    }
    return array;
  }
};

} // namespace margelo::nitro
