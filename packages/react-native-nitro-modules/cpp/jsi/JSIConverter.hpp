//
// Created by Marc Rousavy on 21.02.24.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
template <typename T, typename Enable>
struct JSIConverter;
} // namespace margelo::nitro

#include <jsi/jsi.h>
#include <type_traits>

namespace margelo::nitro {

using namespace facebook;

/**
 * The JSIConverter<T> class can convert any type from and to a jsi::Value.
 * It uses templates to statically create fromJSI/toJSI methods, and will throw compile-time errors
 * if a given type is not convertable.
 * Value types, custom types (HostObjects), and even functions with any number of arguments/types are supported.
 * This type can be extended by just creating a new template for JSIConverter in a header.
 */
template <typename ArgType, typename Enable = void>
struct JSIConverter final {
  JSIConverter() = delete;

  static inline ArgType fromJSI(jsi::Runtime&, const jsi::Value&) {
    static_assert(always_false<ArgType>::value, "This type is not supported by the JSIConverter!");
    return ArgType();
  }
  static inline jsi::Value toJSI(jsi::Runtime&, ArgType) {
    static_assert(always_false<ArgType>::value, "This type is not supported by the JSIConverter!");
    return jsi::Value::undefined();
  }

private:
  template <typename>
  struct always_false : std::false_type {};
};

// int <> number
template <>
struct JSIConverter<int> {
  static inline int fromJSI(jsi::Runtime&, const jsi::Value& arg) {
    return static_cast<int>(arg.asNumber());
  }
  static inline jsi::Value toJSI(jsi::Runtime&, int arg) {
    return jsi::Value(arg);
  }
};

// std::monostate <> null
template <>
struct JSIConverter<std::monostate> {
  static inline std::monostate fromJSI(jsi::Runtime&, const jsi::Value& arg) {
    return std::monostate();
  }
  static inline jsi::Value toJSI(jsi::Runtime&, std::monostate arg) {
    return jsi::Value::null();
  }
};

// double <> number
template <>
struct JSIConverter<double> {
  static inline double fromJSI(jsi::Runtime&, const jsi::Value& arg) {
    return arg.asNumber();
  }
  static inline jsi::Value toJSI(jsi::Runtime&, double arg) {
    return jsi::Value(arg);
  }
};

// float <> number
template <>
struct JSIConverter<float> {
  static inline float fromJSI(jsi::Runtime&, const jsi::Value& arg) {
    return static_cast<float>(arg.asNumber());
  }
  static inline jsi::Value toJSI(jsi::Runtime&, float arg) {
    return jsi::Value(static_cast<double>(arg));
  }
};

// int64_t <> BigInt
template <>
struct JSIConverter<int64_t> {
  static inline double fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    return arg.asBigInt(runtime).asInt64(runtime);
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, int64_t arg) {
    return jsi::BigInt::fromInt64(runtime, arg);
  }
};

// uint64_t <> BigInt
template <>
struct JSIConverter<uint64_t> {
  static inline double fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    return arg.asBigInt(runtime).asUint64(runtime);
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, uint64_t arg) {
    return jsi::BigInt::fromUint64(runtime, arg);
  }
};

// bool <> boolean
template <>
struct JSIConverter<bool> {
  static inline bool fromJSI(jsi::Runtime&, const jsi::Value& arg) {
    return arg.asBool();
  }
  static inline jsi::Value toJSI(jsi::Runtime&, bool arg) {
    return jsi::Value(arg);
  }
};

// std::string <> string
template <>
struct JSIConverter<std::string> {
  static inline std::string fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    return arg.asString(runtime).utf8(runtime);
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, const std::string& arg) {
    return jsi::String::createFromUtf8(runtime, arg);
  }
};

} // namespace margelo::nitro

#include "JSIConverter+AnyMap.hpp"
#include "JSIConverter+ArrayBuffer.hpp"
#include "JSIConverter+Function.hpp"
#include "JSIConverter+HybridObject.hpp"
#include "JSIConverter+Optional.hpp"
#include "JSIConverter+Promise.hpp"
#include "JSIConverter+Tuple.hpp"
#include "JSIConverter+UnorderedMap.hpp"
#include "JSIConverter+Variant.hpp"
#include "JSIConverter+Vector.hpp"
