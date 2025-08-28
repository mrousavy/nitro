//
// Created by Marc Rousavy on 21.02.24.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
class HybridObject;
} // namespace margelo::nitro

#include "IsSharedPtrTo.hpp"
#include "NitroDefines.hpp"
#include "NitroTypeInfo.hpp"
#include <jsi/jsi.h>
#include <type_traits>
#include "JSIConverter+NativeState.hpp"

namespace margelo::nitro {

using namespace facebook;

// HybridObject(NativeState) <> {}
template <typename T>
struct JSIConverter<T, std::enable_if_t<is_shared_ptr_to_v<T, HybridObject>>> final {
  using TPointee = typename T::element_type;

  static inline T fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    auto nativeState = JSIConverter<std::shared_ptr<jsi::NativeState>>::fromJSI(runtime, arg);
    return std::dynamic_pointer_cast<TPointee>(nativeState);
  }

  static inline jsi::Value toJSI(jsi::Runtime& runtime, const T& arg) {
    if (arg == nullptr) [[unlikely]] {
      std::string typeName = TypeInfo::getFriendlyTypename<TPointee>();
      throw jsi::JSError(runtime, "Cannot convert `nullptr` to NativeState<" + typeName + ">!");
    }

    // This uses a smart caching impl using jsi::WeakObject
    return arg->toObject(runtime);
  }

  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    if (value.isObject()) {
      jsi::Object object = value.getObject(runtime);
      return object.hasNativeState<TPointee>(runtime);
    }
    return false;
  }
};

} // namespace margelo::nitro
