//
// Created by Marc Rousavy on 15.01.26.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
template <typename T, typename Enable>
struct SwiftConverter;
} // namespace margelo::nitro

#include <type_traits>
#include <variant>

namespace margelo::nitro {

/**
 * The SwiftConverter<T> class can convert any Swift type from and to a C++ STL type.
 * It uses templates to statically create fromSwift/toSwift methods, and will throw compile-time errors
 * if a given type is not convertable.
 * Value types, custom types (HybridObject), and even functions with any number of arguments/types are supported.
 * This type can be extended by just creating a new template for SwiftConverter in a header.
 */
template <typename T, typename Enable = void>
struct SwiftConverter final {
  SwiftConverter() = delete;

  /**
   * Converts the given C++ STL value to type `T`.
   * By default, this static-asserts.
   */
  static inline T fromSwift(void*) {
    static_assert(always_false<T>::value, "This type is not supported by the SwiftConverter!");
  }
  /**
   * Converts `T` to a C++ STL value.
   * By default, this static-asserts.
   */
  static inline void* toSwift(T) {
    static_assert(always_false<T>::value, "This type is not supported by the SwiftConverter!");
  }

private:
  template <typename>
  struct always_false : std::false_type {};
};

// double <> number
template <>
struct SwiftConverter<double> final {
  static inline double fromSwift(double arg) {
    return arg;
  }
  static inline double toSwift(double arg) {
    return arg;
  }
};

// bool <> boolean
template <>
struct SwiftConverter<bool> final {
  static inline bool fromSwift(bool value) {
    return value;
  }
  static inline bool toSwift(bool value) {
    return value;
  }
};

} // namespace margelo::nitro

#include "SwiftConverter+String.hpp"
