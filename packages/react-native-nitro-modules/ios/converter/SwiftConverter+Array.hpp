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
#include <vector>

namespace margelo::nitro {

// std::vector<ItemType> <> swift::Array<SwiftItemType>
template <typename ItemType>
struct SwiftConverter<std::vector<ItemType>> final {
  using SwiftItemType = SwiftTypeOf<ItemType>;
  using SwiftType = swift::Array<SwiftItemType>;

  static inline std::vector<ItemType> fromSwift(const SwiftType& array) {
    std::vector<ItemType> vector;
    vector.reserve(array.getCount());
    for (const SwiftItemType& item : array) {
      vector.push_back(SwiftConverter<ItemType>::fromSwift(item));
    }
    return vector;
  }

  static inline SwiftType toSwift(const std::vector<ItemType>& vector) {
    auto array = swift::Array<SwiftItemType>::init();
    array.reserveCapacity(vector.size());
    for (const ItemType& item: vector) {
      array.append(SwiftConverter<ItemType>::toSwift(item));
    }
    return array;
  }
};

} // namespace margelo::nitro

#endif
#endif
