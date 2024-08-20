//
//  AnyMapHolder.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 20.08.24.
//

#pragma once

#include "AnyMap.hpp"
#include <memory>

namespace margelo::nitro {

using TSharedMap = std::shared_ptr<AnyMap>;

AnyValue create_AnyValue() {
  return AnyValue(std::monostate);
}

AnyValue create_AnyValue(bool boolValue) {
  return AnyValue(boolValue);
}

AnyValue create_AnyValue(double doubleValue) {
  return AnyValue(doubleValue);
}

AnyValue create_AnyValue(int64_t bigintValue) {
  return AnyValue(bigintValue);
}

AnyValue create_AnyValue(const std::string& stringValue) {
  return AnyValue(stringValue);
}

AnyValue create_AnyValue(const AnyArray& arrayValue) {
  return AnyValue(arrayValue);
}

AnyValue create_AnyValue(const AnyObject& objectValue) {
  return AnyValue(objectValue);
}

std::vector<string> getAnyObjectKeys(const AnyObject& object) {
  std::vector<string> keys;
  keys.reserve(object.size());
  for (const auto& entry : object) {
    keys.push_back(entry.first);
  }
  return keys;
}

} // namespace margelo::nitro
