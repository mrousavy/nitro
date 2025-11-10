//
// Created by Marc Rousavy on 30.07.24.
//

#pragma once

#include "NitroDefines.hpp"
#include <functional>
#include <type_traits>

namespace margelo::nitro {

struct NullType final {
  constexpr NullType() noexcept = default;
};

/**
 * Represents an explicit `null` from JS.
 * This is a singleton.
 */
inline NullType null{};

// Equality and ordering: all instances are equal
constexpr bool operator==(NullType, NullType) noexcept {
  return true;
}
constexpr bool operator!=(NullType, NullType) noexcept {
  return false;
}

} // namespace margelo::nitro

// Makes nitro::Null hashable
namespace std {
template <>
struct hash<margelo::nitro::NullType> {
  size_t operator()(margelo::nitro::NullType) const noexcept {
    return 0x9E3779B97F4A7C15ull;
  }
};
} // namespace std
