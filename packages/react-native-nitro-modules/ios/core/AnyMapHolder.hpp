//
//  AnyMapHolder.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 20.08.24.
//

#pragma once

#include "AnyMap.hpp"

namespace margelo::nitro {

using TSharedMap = std::shared_ptr<AnyMap>;

AnyValue create_AnyValue() {
  return AnyValue(std::monostate{ });
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

bool is_AnyValue_null(const AnyValue& value) {
  return std::holds_alternative<std::monostate>(value);
}
bool is_AnyValue_bool(const AnyValue& value) {
  return std::holds_alternative<bool>(value);
}
bool is_AnyValue_number(const AnyValue& value) {
  return std::holds_alternative<double>(value);
}
bool is_AnyValue_bigint(const AnyValue& value) {
  return std::holds_alternative<int64_t>(value);
}
bool is_AnyValue_string(const AnyValue& value) {
  return std::holds_alternative<std::string>(value);
}
bool is_AnyValue_AnyArray(const AnyValue& value) {
  return std::holds_alternative<AnyArray>(value);
}
bool is_AnyValue_AnyObject(const AnyValue& value) {
  return std::holds_alternative<AnyObject>(value);
}

std::monostate get_AnyValue_null(const AnyValue& value) {
  return std::get<std::monostate>(value);
}
bool get_AnyValue_bool(const AnyValue& value) {
  return std::get<bool>(value);
}
double get_AnyValue_number(const AnyValue& value) {
  return std::get<double>(value);
}
int64_t get_AnyValue_bigint(const AnyValue& value) {
  return std::get<int64_t>(value);
}
std::string get_AnyValue_string(const AnyValue& value) {
  return std::get<std::string>(value);
}
AnyArray get_AnyValue_AnyArray(const AnyValue& value) {
  return std::get<AnyArray>(value);
}
AnyObject get_AnyValue_AnyObject(const AnyValue& value) {
  return std::get<AnyObject>(value);
}

std::vector<std::string> getAnyObjectKeys(const AnyObject& object) {
  std::vector<std::string> keys;
  keys.reserve(object.size());
  for (const auto& entry : object) {
    keys.push_back(entry.first);
  }
  return keys;
}

} // namespace margelo::nitro
