//
// Created by Marc Rousavy on 21.02.24.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
struct AnyValue;
class AnyMap;

template <typename T, typename Enable>
struct JSIConverter;
} // namespace margelo::nitro

#include "JSIConverter+UnorderedMap.hpp"
#include "JSIConverter+Vector.hpp"
#include "JSIConverter.hpp"

#include "AnyMap.hpp"
#include "IsInPack.hpp"
#include "TypeInfo.hpp"
#include <jsi/jsi.h>
#include <memory>
#include <variant>

namespace margelo::nitro {

using namespace facebook;

// std::variant<A, B, C> <> A | B | C
template <typename... Types>
struct JSIConverter<std::variant<Types...>> {
  
  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    // Check each type in `Types...` to make sure we can convert `jsi::Value` to one of those.
    return (JSIConverter<Types>::canConvert(runtime, value) || ...);
  }
  
  static inline std::variant<Types...> fromJSI(jsi::Runtime& runtime, const jsi::Value& value) {
    return fromJSIRecursive<Types...>(runtime, value);
  }

  static inline jsi::Value toJSI(jsi::Runtime& runtime, const std::variant<Types...>& variant) {
    return std::visit([&runtime](const auto& val) { return JSIConverter<std::decay_t<decltype(val)>>::toJSI(runtime, val); }, variant);
  }

private:
  static inline std::runtime_error typeNotSupportedError(const std::string& type) {
    std::string types = TypeInfo::getFriendlyTypenames<Types...>();
    return std::runtime_error(type + " is not supported in variant<" + types + ">!");
  }
  
  template <typename First, typename... Rest>
  static inline std::variant<Types...> fromJSIRecursive(jsi::Runtime& runtime, const jsi::Value& value) {
      if (JSIConverter<First>::canConvert(runtime, value)) {
          return JSIConverter<First>::fromJSI(runtime, value);
      }
    if constexpr (sizeof...(Rest) == 0) {
      throw std::runtime_error("No values left!");
    } else {
      return fromJSIRecursive<Rest...>(runtime, value);
    }
  }
};

} // namespace margelo::nitro
