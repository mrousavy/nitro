//
// Created by Marc Rousavy on 15.01.26.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
template <typename T, typename Enable>
struct SwiftConverter;
} // namespace margelo::nitro

#ifdef SWIFT_SWIFT_H // <-- -Swift.h needs to be imported for this to work

#include "SwiftConverter.hpp"
#include <vector>

namespace margelo::nitro {

// std::vector<T> <> swift::Array<SwiftT>
template <typename T>
struct SwiftConverter<std::vector<T>> final {
  using SwiftType = swift::Array<typename SwiftConverter<T>::SwiftType>;
  static inline std::vector<T> fromSwift(const SwiftType& array) {
    auto size = array.getCount();
    std::vector<T> vector;
    vector.reserve(size);
    for (size_t i = 0; i < size; i++) {
      vector.push_back(SwiftConverter<T>::fromSwift(array[i]));
    }
    return vector;
  }
  static inline SwiftType toSwift(const std::vector<T>& vector) {
    size_t size = vector.size();
    auto array = swift::Array<typename SwiftConverter<T>::SwiftType>::init();
    array.reserveCapacity(size);
    for (size_t i = 0; i < size; i++) {
      array.append(SwiftConverter<T>::toSwift(vector[i]));
    }
    return array;
  }
};

} // namespace margelo::nitro

#endif
