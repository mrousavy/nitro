//
// Created by Marc Rousavy on 15.01.26.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
template <typename T, typename Enable>
struct SwiftConverter;
} // namespace margelo::nitro

namespace swift {
  class String;
}

#include "SwiftConverter.hpp"
#include <string>

namespace margelo::nitro {

// std::string <> swift::String
template <>
struct SwiftConverter<std::string> final {
  using SwiftType = swift::String;
  static std::string fromSwift(const swift::String& string);
  static swift::String toSwift(const std::string& string);
};

} // namespace margelo::nitro
