//
// Created by Marc Rousavy on 15.01.26.
//

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
template <typename T, typename Enable>
struct SwiftConverter;
} // namespace margelo::nitro

#ifdef SWIFT_SWIFT_H // <-- -Swift.h needs to be imported for this to work
#ifndef SWIFT_CONVERTER_ARRAY
#define SWIFT_CONVERTER_ARRAY

#include "SwiftConverter.hpp"
#include "SwiftClosure.hpp"
#include <string>

namespace margelo::nitro {

// std::function<R(Args...)> <> SwiftClosure<R(Args...)>
template <typename R, typename... Args>
struct SwiftConverter<std::function<R(Args...)>> final {
  using SwiftType = SwiftFunction<SwiftTypeOf<R>(SwiftTypeOf<Args>...)>;

  static inline std::function<R(Args...)> fromSwift(const SwiftType& swiftClosure) {
    return swiftClosure; // <-- it's callable, so auto-convertable to std::function.
  }
  static inline SwiftType toSwift(const std::function<R(Args...)>& function) {
    return SwiftType(function);
  }
};

} // namespace margelo::nitro

#endif
#endif
