//
// Created by Marc Rousavy on 15.01.26.
//


// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
template <typename T, typename Enable>
struct SwiftConverter;
} // namespace margelo::nitro

#ifdef SWIFT_IS_IMPORTED
#ifndef SWIFT_CONVERTER
#define SWIFT_CONVERTER

#include <type_traits>
#include <variant>

namespace margelo::nitro {

/**
 * The SwiftConverter<T> class can convert any Swift type from and to a C++ STL type.
 * It uses templates to statically create fromSwift/toSwift methods, and will throw compile-time errors
 * if a given type is not convertable.
 * Value types, custom types (HybridObject), and even functions with any number of arguments/types are supported.
 * This type can be extended by just creating a new template for SwiftConverter in a header.
 *
 * Before including the `SwiftConverter.hpp`, you must include your module's `-Swift.h` header
 * to be able to use all Swift types (like `swift::Optional<T>`, `swift::Array<T>`, ...)
 */
template <typename T, typename Enable = void>
struct SwiftConverter final {
  SwiftConverter() = delete;

  /**
   * Represents the Swift type that this C++ STL Type `T` is convertable to.
   */
  using SwiftType = void*;

  /**
   * Converts the given Swift value to the C++ STL type `T`.
   * By default, this static-asserts.
   */
  template <typename Never>
  static inline T fromSwift(Never&&) {
    static_assert(always_false<T>::value, "This type is not supported by the SwiftConverter!");
  }
  /**
   * Converts the C++ STL type `T` to a Swift value.
   * By default, this static-asserts.
   */
  static inline void* toSwift(T) {
    static_assert(always_false<T>::value, "This type is not supported by the SwiftConverter!");
  }

private:
  template <typename>
  struct always_false : std::false_type {};
};

/**
 * Gets the Swift type for the given C++ type.
 */
template <typename T>
using SwiftTypeOf = typename SwiftConverter<T>::SwiftType;

// double <> number
template <>
struct SwiftConverter<double> final {
  using SwiftType = double;
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
  using SwiftType = bool;
  static inline bool fromSwift(bool value) {
    return value;
  }
  static inline bool toSwift(bool value) {
    return value;
  }
};

} // namespace margelo::nitro

#include "SwiftConverter+String.hpp"
#include "SwiftConverter+Optional.hpp"
#include "SwiftConverter+Array.hpp"
#include "SwiftConverter+Function.hpp"

#endif
#else
#warning Tried including `SwiftConverter.hpp`, but `SWIFT_IS_IMPORTED` is not defined. Import the `-Swift.h` header, define `SWIFT_IS_IMPORTED`, and try again.
#endif
