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

#include "IsInPack.hpp"
#include "TypeInfo.hpp"
#include <memory>
#include <variant>

namespace margelo::nitro {

using namespace facebook;

// std::variant<A, B, C> <> A | B | C
template <typename... Types>
struct JSIConverter<std::variant<Types...>> {
  static inline std::variant<Types...> fromJSI(jsi::Runtime& runtime, const jsi::Value& value) {
    if (value.isNull()) {
      if constexpr (is_in_pack_v<std::monostate, Types...>) {
        return std::monostate();
      } else {
        throw typeNotSupportedError("null");
      }
    } else if (value.isBool()) {
      if constexpr (is_in_pack_v<bool, Types...>) {
        return JSIConverter<bool>::fromJSI(runtime, value);
      } else {
        throw typeNotSupportedError("boolean");
      }
    } else if (value.isNumber()) {
      if constexpr (is_in_pack_v<double, Types...>) {
        return JSIConverter<double>::fromJSI(runtime, value);
      } else {
        throw typeNotSupportedError("number");
      }
    } else if (value.isString()) {
      if constexpr (is_in_pack_v<std::string, Types...>) {
        return JSIConverter<std::string>::fromJSI(runtime, value);
      } else {
        throw typeNotSupportedError("string");
      }
    } else if (value.isBigInt()) {
      if constexpr (is_in_pack_v<int64_t, Types...>) {
        return JSIConverter<int64_t>::fromJSI(runtime, value);
      } else {
        throw typeNotSupportedError("bigint");
      }
    } else if (value.isObject()) {
      jsi::Object valueObj = value.getObject(runtime);
      if (valueObj.isArray(runtime)) {
        if constexpr (is_in_pack_v<std::vector<AnyValue>, Types...>) {
          return JSIConverter<std::vector<AnyValue>>::fromJSI(runtime, value);
        } else {
          throw typeNotSupportedError("array[]");
        }
      } else {
        if constexpr (is_in_pack_v<std::unordered_map<std::string, AnyValue>, Types...>) {
          return JSIConverter<std::unordered_map<std::string, AnyValue>>::fromJSI(runtime, value);
        } else {
          throw typeNotSupportedError("object{}");
        }
      }
    } else {
      std::string stringRepresentation = value.toString(runtime).utf8(runtime);
      throw std::runtime_error("Cannot convert \"" + stringRepresentation + "\" to std::variant<...>!");
    }
  }

  static inline jsi::Value toJSI(jsi::Runtime& runtime, const std::variant<Types...>& variant) {
    return std::visit([&runtime](const auto& val) { return JSIConverter<std::decay_t<decltype(val)>>::toJSI(runtime, val); }, variant);
  }

private:
  static inline std::runtime_error typeNotSupportedError(const std::string& type) {
    std::string types = TypeInfo::getFriendlyTypenames<Types...>();
    return std::runtime_error(type + " is not supported in variant<" + types + ">!");
  }
};

} // namespace margelo::nitro
