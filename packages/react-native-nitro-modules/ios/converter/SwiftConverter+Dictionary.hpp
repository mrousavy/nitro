//
// Created by Marc Rousavy on 15.01.26.
//

#pragma once

#include "SwiftConverter.hpp"
#include <unordered_map>

namespace margelo::nitro {

// std::unordered_map<K, V> <> swift::Dictionary<K, V>
template <typename K, typename V>
struct SwiftConverter<std::unordered_map<K, V>> final {
  // TODO: Swift does not expose Dictionary<K, V> to C++ yet...
  using SwiftType = double;

  static inline std::unordered_map<K, V> fromSwift(double swiftMap) {
    return {};
  }

  static inline SwiftType toSwift(const std::unordered_map<K, V>& cppMap) {
    return 0;
  }
};

} // namespace margelo::nitro

