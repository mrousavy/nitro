//
// Created by Marc Rousavy on 15.01.26.
//

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
template <typename T, typename Enable>
struct SwiftConverter;
} // namespace margelo::nitro

#ifdef SWIFT_IS_IMPORTED // <-- this needs to be defined by the user first
#ifndef SWIFT_CONVERTER_OPTIONAL
#define SWIFT_CONVERTER_OPTIONAL

#include "SwiftConverter.hpp"
#include <optional>

namespace margelo::nitro {

// std::optional<T> <> swift::Optional<SwiftT>
template <typename T>
struct SwiftConverter<std::optional<T>> final {
  using SwiftType = swift::Optional<SwiftTypeOf<T>>;
  static std::optional<T> fromSwift(const SwiftType& optional) {
    if (optional.isSome()) {
      return SwiftConverter<T>::fromSwift(optional.getSome());
    } else {
      return std::nullopt;
    }
  }
  static SwiftType toSwift(const std::optional<T>& optional) {
    if (optional.has_value()) {
      return SwiftType::some(SwiftConverter<T>::toSwift(optional.value()));
    } else {
      return SwiftType::none();
    }
  }
};

} // namespace margelo::nitro

#endif
#endif
