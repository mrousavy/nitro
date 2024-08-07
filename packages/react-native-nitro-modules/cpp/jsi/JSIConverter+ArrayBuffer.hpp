//
// Created by Marc Rousavy on 21.02.24.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
class ArrayBuffer;
class JSICache;

template <typename T, typename Enable>
struct JSIConverter;
} // namespace margelo::nitro

#include "JSIConverter.hpp"

#include "ArrayBuffer.hpp"
#include "IsSharedPtrTo.hpp"
#include "JSICache.hpp"
#include <jsi/jsi.h>
#include <memory>
#include <type_traits>

namespace margelo::nitro {

using namespace facebook;

// MutableBuffer <> ArrayBuffer
template <typename T>
struct JSIConverter<T, std::enable_if_t<is_shared_ptr_to_v<T, jsi::MutableBuffer>>> {
  static inline std::shared_ptr<ArrayBuffer> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    jsi::Object object = arg.asObject(runtime);
    if (!object.isArrayBuffer(runtime)) [[unlikely]] {
      throw std::runtime_error("Object \"" + arg.toString(runtime).utf8(runtime) + "\" is not an ArrayBuffer!");
    }

    JSICacheReference cache = JSICache::getOrCreateCache(runtime);
    auto owningArrayBuffer = cache.makeGlobal<jsi::ArrayBuffer>(object.getArrayBuffer(runtime));

    return std::make_shared<JSArrayBuffer>(&runtime, owningArrayBuffer);
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, const std::shared_ptr<jsi::MutableBuffer>& buffer) {
    return jsi::ArrayBuffer(runtime, buffer);
  }
  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    if (value.isObject()) {
      jsi::Object object = value.getObject(runtime);
      return object.isArrayBuffer(runtime);
    }
    return false;
  }
};

} // namespace margelo::nitro
