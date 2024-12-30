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

namespace margelo::nitro {

using namespace facebook;

// HybridObject(NativeState) <> {}
template <typename T>
struct JSIConverter<T, std::enable_if_t<is_shared_ptr_to_v<T, jsi::NativeState>>> final {
  using TPointee = typename T::element_type;

  static inline T fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
#ifdef NITRO_DEBUG
    if (!arg.isObject()) [[unlikely]] {
      if (arg.isUndefined()) [[unlikely]] {
        throw jsi::JSError(runtime, invalidTypeErrorMessage("undefined", "It is undefined!"));
      } else {
        std::string stringRepresentation = arg.toString(runtime).utf8(runtime);
        throw jsi::JSError(runtime, invalidTypeErrorMessage(stringRepresentation, "It is not an object!"));
      }
    }
#endif
    jsi::Object object = arg.asObject(runtime);

#ifdef NITRO_DEBUG
    if (!object.hasNativeState<TPointee>(runtime)) [[unlikely]] {
      if (!object.hasNativeState(runtime)) [[unlikely]] {
        std::string stringRepresentation = arg.toString(runtime).utf8(runtime);
        throw jsi::JSError(runtime, invalidTypeErrorMessage(stringRepresentation, "It does not have a NativeState!"));
      } else {
        std::string stringRepresentation = arg.toString(runtime).utf8(runtime);
        throw jsi::JSError(runtime, invalidTypeErrorMessage(stringRepresentation, "It has a different NativeState<T>!"));
      }
    }
#endif
    std::shared_ptr<jsi::NativeState> nativeState = object.getNativeState(runtime);
    return std::dynamic_pointer_cast<TPointee>(nativeState);
  }

  static inline jsi::Value toJSI(jsi::Runtime& runtime, const T& arg) {
    if (arg == nullptr) [[unlikely]] {
      std::string typeName = TypeInfo::getFriendlyTypename<TPointee>();
      throw jsi::JSError(runtime, "Cannot convert `nullptr` to NativeState<" + typeName + ">!");
    }

    if constexpr (std::is_base_of_v<HybridObject, TPointee>) {
      // It's a HybridObject - use it's internal constructor which caches jsi::Objects for proper memory management!
      return arg->toObject(runtime);
    } else {
      // It's any other kind of jsi::NativeState - just create it as normal. This will not have a prototype then!
      jsi::Object object(runtime);
      object.setNativeState(runtime, arg);
      return object;
    }
  }

  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    if (value.isObject()) {
      jsi::Object object = value.getObject(runtime);
      return object.hasNativeState<TPointee>(runtime);
    }
    return false;
  }

private:
  static std::string invalidTypeErrorMessage(const std::string& typeDescription, const std::string& reason) {
    std::string typeName = TypeInfo::getFriendlyTypename<TPointee>();
    return "Cannot convert \"" + typeDescription + "\" to NativeState<" + typeName + ">! " + reason;
  }
};

} // namespace margelo::nitro
