//
// Created by Marc Rousavy on 21.02.24.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
class ArrayBuffer;

template <typename T, typename Enable>
struct JSIConverter;
} // namespace margelo::nitro

#include "JSIConverter.hpp"

#include "ArrayBuffer.hpp"
#include <memory>

namespace margelo::nitro {

using namespace facebook;

// MutableBuffer <> ArrayBuffer
template <>
struct JSIConverter<std::shared_ptr<jsi::MutableBuffer>> {
  static inline std::shared_ptr<ArrayBuffer> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    jsi::Object object = arg.asObject(runtime);
    if (!object.isArrayBuffer(runtime)) [[unlikely]] {
      throw std::runtime_error("Object \"" + arg.toString(runtime).utf8(runtime) + "\" is not an ArrayBuffer!");
    }
    jsi::ArrayBuffer arrayBuffer = object.getArrayBuffer(runtime);
    return std::make_shared<ArrayBuffer>(arrayBuffer.data(runtime), arrayBuffer.size(runtime), false);
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, std::shared_ptr<jsi::MutableBuffer> buffer) {
    return jsi::ArrayBuffer(runtime, buffer);
  }
};

} // namespace margelo::nitro
