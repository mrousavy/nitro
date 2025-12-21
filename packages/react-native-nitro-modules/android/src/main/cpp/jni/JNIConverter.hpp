//
// Created by Marc Rousavy on 21.12.25.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
template <typename T, typename Enable>
struct JNIConverter;
} // namespace margelo::nitro

#include <fbjni/fbjni.h>
#include <type_traits>

namespace margelo::nitro {

using namespace facebook;

/**
 * The JNIConverter<T> class can convert any type from and to a JNI type.
 * It uses templates to statically create fromJNI/toJNI methods, and will throw compile-time errors
 * if a given type is not convertable.
 * Value types, custom types (HybridObject), and even functions with any number of arguments/types are supported.
 * This type can be extended by just creating a new template for JNIConverter in a header.
 */
template <typename T, typename Enable = void>
struct JNIConverter final {
  JNIConverter() = delete;

  /**
   * Converts the given `jsi::Value` to type `T`.
   * By default, this static-asserts.
   */
  static inline T fromJNI(const jobject&) {
    static_assert(always_false<T>::value, "This type is not supported by the JNIConverter!");
    return T();
  }
  /**
   * Converts `T` to a `jsi::Value`.
   * By default, this static-asserts.
   */
  static inline jobject toJSI(T) {
    static_assert(always_false<T>::value, "This type is not supported by the JNIConverter!");
    return nullptr;
  }
  /**
   * Returns whether the given `jobject` can be converted to `T`.
   * This involves runtime type-checks.
   * By default, this returns `false`.
   */
  static inline bool canConvert(const jobject&) {
    return false;
  }

private:
  template <typename>
  struct always_false : std::false_type {};
};

// int <> jint
template <>
struct JNIConverter<int> final {
  static inline int fromJSI(jint arg) {
    return static_cast<int>(arg);
  }
  static inline jint toJSI(int arg) {
    return static_cast<jint>(arg);
  }
  static inline bool canConvert(jint arg) {
    return true;
  }
};

// std::string <> jstring
template <>
struct JNIConverter<std::string> final {
  static inline jni::local_ref<jni::JString> fromJSI(const std::string& arg) {
    return jni::make_jstring(arg);
  }
  static inline std::string toJSI(const jni::alias_ref<jni::JString>& arg) {
    if (arg == nullptr) [[unlikely]] {
      throw std::runtime_error("Failed to convert jni::alias_ref<jni::JString> to std::string - it is null!");
    }
    return arg->toStdString();
  }
  static inline bool canConvert(const jni::alias_ref<jni::JString>& arg) {
    return arg != nullptr;
  }
};

} // namespace margelo::nitro
