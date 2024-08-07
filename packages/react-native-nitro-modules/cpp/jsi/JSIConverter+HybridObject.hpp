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

#include "JSIConverter.hpp"

#include "HybridObject.hpp"
#include "IsSharedPtrTo.hpp"
#include "TypeInfo.hpp"
#include <jsi/jsi.h>
#include <memory>
#include <type_traits>

#define DO_NULL_CHECKS true

namespace margelo::nitro {

using namespace facebook;

// HybridObject <> {}
template <typename T>
struct JSIConverter<T, std::enable_if_t<is_shared_ptr_to_v<T, jsi::HostObject>>> {
  using TPointee = typename T::element_type;

  static inline T fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
#if DO_NULL_CHECKS
    if (arg.isUndefined()) [[unlikely]] {
      throw jsi::JSError(runtime, invalidTypeErrorMessage("undefined", "It is undefined!"));
    }
    if (!arg.isObject()) [[unlikely]] {
      std::string stringRepresentation = arg.toString(runtime).utf8(runtime);
      throw jsi::JSError(runtime, invalidTypeErrorMessage(stringRepresentation, "It is not an object!"));
    }
#endif
    jsi::Object object = arg.asObject(runtime);
#if DO_NULL_CHECKS
    if (!object.isHostObject(runtime)) [[unlikely]] {
      std::string stringRepresentation = arg.toString(runtime).utf8(runtime);
      throw jsi::JSError(runtime, invalidTypeErrorMessage(stringRepresentation, "It is not a HostObject!"));
    }
    if (!object.isHostObject<TPointee>(runtime)) [[unlikely]] {
      std::string stringRepresentation = arg.toString(runtime).utf8(runtime);
      throw jsi::JSError(runtime, invalidTypeErrorMessage(stringRepresentation, "It is a different HostObject<T>!"));
    }
#endif
    return object.asHostObject<TPointee>(runtime);
  }

  static inline jsi::Value toJSI(jsi::Runtime& runtime, const T& arg) {
#if DO_NULL_CHECKS
    if (arg == nullptr) [[unlikely]] {
      std::string typeName = TypeInfo::getFriendlyTypename<TPointee>();
      throw jsi::JSError(runtime, "Cannot convert nullptr to HostObject<" + typeName + ">!");
    }
#endif
    if constexpr (std::is_base_of_v<HybridObject, TPointee>) {
      // It's a HybridObject - use it's internal constructor which caches jsi::Objects for proper memory management!
      return arg->toObject(runtime);
    } else {
      // It's any other kind of jsi::HostObject - just create it as normal.
      return jsi::Object::createFromHostObject(runtime, arg);
    }
  }

  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    if (value.isObject()) {
      jsi::Object object = value.getObject(runtime);
      return object.isHostObject<TPointee>(runtime);
    }
    return false;
  }

private:
  static inline std::string invalidTypeErrorMessage(const std::string& typeDescription, const std::string& reason) {
    std::string typeName = TypeInfo::getFriendlyTypename<TPointee>();
    return "Cannot convert \"" + typeDescription + "\" to HostObject<" + typeName + ">! " + reason;
  }
};

// NativeState <> {}
template <typename T>
struct JSIConverter<T, std::enable_if_t<is_shared_ptr_to_v<T, jsi::NativeState>>> {
  using TPointee = typename T::element_type;

  static inline T fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
#if DO_NULL_CHECKS
    if (arg.isUndefined()) [[unlikely]] {
      throw jsi::JSError(runtime, invalidTypeErrorMessage("undefined", "It is undefined!"));
    }
    if (!arg.isObject()) [[unlikely]] {
      std::string stringRepresentation = arg.toString(runtime).utf8(runtime);
      throw jsi::JSError(runtime, invalidTypeErrorMessage(stringRepresentation, "It is not an object!"));
    }
#endif
    jsi::Object object = arg.asObject(runtime);
#if DO_NULL_CHECKS
    if (!object.hasNativeState(runtime)) [[unlikely]] {
      std::string stringRepresentation = arg.toString(runtime).utf8(runtime);
      throw jsi::JSError(runtime, invalidTypeErrorMessage(stringRepresentation, "It is not a NativeState!"));
    }
    if (!object.hasNativeState<TPointee>(runtime)) [[unlikely]] {
      std::string stringRepresentation = arg.toString(runtime).utf8(runtime);
      throw jsi::JSError(runtime, invalidTypeErrorMessage(stringRepresentation, "It is a different NativeState<T>!"));
    }
#endif
    return object.getNativeState<TPointee>(runtime);
  }

  static inline jsi::Value toJSI(jsi::Runtime& runtime, const T& arg) {
#if DO_NULL_CHECKS
    if (arg == nullptr) [[unlikely]] {
      std::string typeName = TypeInfo::getFriendlyTypename<TPointee>();
      throw jsi::JSError(runtime, "Cannot convert nullptr to NativeState<" + typeName + ">!");
    }
#endif
    if constexpr (std::is_base_of_v<HybridObject, TPointee>) {
      // It's a HybridObject - use it's internal constructor which caches jsi::Objects for proper memory management!
      return arg->toObject(runtime);
    } else {
      // It's any other kind of jsi::HostObject - just create it as normal. This will not have a prototype then!
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
  static inline std::string invalidTypeErrorMessage(const std::string& typeDescription, const std::string& reason) {
    std::string typeName = TypeInfo::getFriendlyTypename<TPointee>();
    return "Cannot convert \"" + typeDescription + "\" to NativeState<" + typeName + ">! " + reason;
  }
};

} // namespace margelo::nitro
