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
#include <string>

namespace margelo::nitro {

// std::string <> swift::String
template <>
struct SwiftConverter<std::string> final {
  using SwiftType = swift::String;
  static inline std::string fromSwift(const swift::String& string) {
    return string;
  }
  static inline swift::String toSwift(const std::string& string) {
    return swift::String(string);
  }
};

} // namespace margelo::nitro

#endif
#endif
