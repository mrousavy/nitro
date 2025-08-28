//
//  CustomString.hpp
//  NitroTest
//
//  Created by Marc Rousavy on 28.08.25.
//

#pragma once

#include <NitroModules/JSIConverter.hpp>
#include <string>

namespace margelo::nitro::test {

// for demonstration, let's use a zero-copy std::string_view
using CustomString = std::string_view;

}; // namespace margelo::nitro::test

namespace margelo::nitro {

template <>
struct JSIConverter<test::CustomString> final {
  static inline test::CustomString fromJSI(jsi::Runtime&, const jsi::Value& arg) {
    throw std::runtime_error("not yet implemented!");
  }
  static inline jsi::Value toJSI(jsi::Runtime&, test::CustomString arg) {
    throw std::runtime_error("not yet implemented!");
  }
  static inline bool canConvert(jsi::Runtime&, const jsi::Value& value) {
    return value.isString();
  }
}

} // namespace margelo::nitro
