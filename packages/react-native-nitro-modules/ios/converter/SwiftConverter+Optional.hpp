//
// Created by Marc Rousavy on 15.01.26.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
template <typename T, typename Enable>
struct SwiftConverter;
} // namespace margelo::nitro

#ifdef SWIFT_SWIFT_H

#include "SwiftConverter.hpp"
#include <optional>

namespace margelo::nitro {

// std::string <> swift::String
template <typename T>
struct SwiftConverter<std::optional<T>> final {
  using SwiftType = swift::Optional<typename SwiftConverter<T>::SwiftType>;
  static std::optional<T> fromSwift(const SwiftType& optional) {
    if (optional.isSome()) {
      return SwiftConverter<T>::fromSwift(optional.getSome());
    } else {
      return std::nullopt;
    }
  }
  static SwiftType toSwift(const std::optional<T>& optional) {
    if (optional.has_value()) {
      return SwiftType(SwiftConverter<T>::toSwift(optional.value()));
    } else {
      return SwiftType();
    }
  }
};

} // namespace margelo::nitro

#endif
