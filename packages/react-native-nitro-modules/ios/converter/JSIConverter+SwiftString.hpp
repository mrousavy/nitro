//
// Created by Marc Rousavy on 20.01.26.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
template <typename T, typename Enable>
struct JSIConverter;
} // namespace margelo::nitro

namespace swift {
  class String;
}

#include "JSIConverter.hpp"

#include <jsi/jsi.h>

namespace margelo::nitro {

using namespace facebook;

// string <> swift::String
template <>
struct JSIConverter<swift::String> final {
  static swift::String fromJSI(jsi::Runtime& runtime, const jsi::Value& arg);
  static jsi::Value toJSI(jsi::Runtime& runtime, const swift::String& date);
  static bool canConvert(jsi::Runtime& runtime, const jsi::Value& value);
};

} // namespace margelo::nitro
