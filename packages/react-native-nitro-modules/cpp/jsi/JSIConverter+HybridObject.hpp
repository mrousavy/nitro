//
// Created by Marc Rousavy on 21.02.24.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
class HybridObject;

template <typename T, typename Enable>
struct JSIConverter;
} // namespace margelo::nitro

#include "IsSharedPtrTo.hpp"
#include "NitroDefines.hpp"
#include "NitroTypeInfo.hpp"
#include <jsi/jsi.h>
#include <type_traits>

namespace margelo::nitro {

using namespace facebook;

// HybridObject(NativeState) <> {}
template <typename T>
struct JSIConverter<T, std::enable_if_t<is_shared_ptr_to_v<T, HybridObject>>> final {
  using TPointee = typename T::element_type;

  static inline T fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    // forward to base
    return JSIConverter<std::shared_ptr<jsi::NativeState>>::fromJSI(runtime, arg);
  }

  static inline jsi::Value toJSI(jsi::Runtime& runtime, const T& arg) {
    if (arg == nullptr) [[unlikely]] {
      std::string typeName = TypeInfo::getFriendlyTypename<TPointee>();
      throw jsi::JSError(runtime, "Cannot convert `nullptr` to HybridObject<" + typeName + ">!");
    }

    // The internal ->toObject method caches jsi::Objects
    return arg->toObject(runtime);
  }

  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    // forward to base
    return JSIConverter<std::shared_ptr<jsi::NativeState>>::canConvert(runtime, value);
  }
};

} // namespace margelo::nitro
