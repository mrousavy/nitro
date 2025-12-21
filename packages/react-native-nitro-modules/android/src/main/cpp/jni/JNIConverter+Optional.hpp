//
// Created by Marc Rousavy on 21.12.25.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
template <typename T, typename Enable>
struct JNIConverter;
} // namespace margelo::nitro

#include "JNIConverter.hpp"
#include <fbjni/fbjni.h>
#include <type_traits>

namespace margelo::nitro {

using namespace facebook;

// std::optional<T> <> jni::alias_ref<T>
template <typename TCpp>
struct JNIConverter<std::optional<TCpp>> final {
  template <class TJava>
  static inline std::optional<TCpp> fromJNI(jni::local_ref<TJava> arg) {
    if (arg == nullptr)
      return std::nullopt;

    TCpp cppValue = JNIConverter<TCpp>::template fromJNI<TJava>(arg);
    return std::make_optional(std::move(cppValue));
  }

  template <class TJava>
  static inline jni::local_ref<TJava> toJNI(std::optional<TCpp> arg) {
    if (!arg.has_value())
      return nullptr;

    jni::local_ref<TJava> javaValue = JNIConverter<TCpp>::template toJNI<TJava>(arg);
    return javaValue;
  }

  static inline bool canConvert(jni::local_ref<TCpp> arg) {
    return arg != nullptr;
  }
};

} // namespace margelo::nitro
