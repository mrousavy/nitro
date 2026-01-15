//
// Created by Marc Rousavy on 15.01.26.
//

#include "SwiftConverter+String.hpp"

#include "AnyMap.hpp"
#include "AnyMapHolder.hpp"
#include "NitroModules-Swift.h"

namespace margelo::nitro {

std::string SwiftConverter<std::string>::fromSwift(const swift::String& string) {
  return string;
}
swift::String SwiftConverter<std::string>::toSwift(const std::string& string) {
  return swift::String(string);
}

} // namespace margelo::nitro
