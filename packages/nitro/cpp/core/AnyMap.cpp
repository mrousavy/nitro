//
// Created by Marc Rousavy on 30.07.24.
//

#include "AnyMap.hpp"

namespace margelo::nitro {

// Contains
bool AnyMap::contains(const std::string& key) const {
  return _map.contains(key);
}
void AnyMap::remove(const std::string& key) {
  _map.erase(key);
}
void AnyMap::clear() noexcept {
  _map.clear();
}

// Is
bool AnyMap::isNull(const std::string& key) const {
  auto found = _map.find(key);
  if (found == _map.end()) {
    return false;
  }
  return std::holds_alternative<std::monostate>(found->second);
}
bool AnyMap::isDouble(const std::string& key) const {
  auto found = _map.find(key);
  if (found == _map.end()) {
    return false;
  }
  return std::holds_alternative<double>(found->second);
}
bool AnyMap::isBoolean(const std::string& key) const {
  auto found = _map.find(key);
  if (found == _map.end()) {
    return false;
  }
  return std::holds_alternative<bool>(found->second);
}
bool AnyMap::isBigInt(const std::string& key) const {
  auto found = _map.find(key);
  if (found == _map.end()) {
    return false;
  }
  return std::holds_alternative<int64_t>(found->second);
}
bool AnyMap::isString(const std::string& key) const {
  auto found = _map.find(key);
  if (found == _map.end()) {
    return false;
  }
  return std::holds_alternative<std::string>(found->second);
}
bool AnyMap::isArray(const std::string& key) const {
  auto found = _map.find(key);
  if (found == _map.end()) {
    return false;
  }
  return std::holds_alternative<AnyArray>(found->second);
}
bool AnyMap::isObject(const std::string& key) const {
  auto found = _map.find(key);
  if (found == _map.end()) {
    return false;
  }
  return std::holds_alternative<AnyObject>(found->second);
}

// Get
std::monostate AnyMap::getNull(const std::string& key) const {
  auto found = _map.find(key);
  if (found == _map.end()) {
    throw std::runtime_error("The key \"" + key + "\" does not exist in this Map!");
  }
  if (auto result = std::get_if<std::monostate>(&found->second)) {
    return *result;
  } else {
    throw std::runtime_error("The value at key \"" + key + "\" is not a null!");
  }
}
double AnyMap::getDouble(const std::string& key) const {
  auto found = _map.find(key);
  if (found == _map.end()) {
    throw std::runtime_error("The key \"" + key + "\" does not exist in this Map!");
  }
  if (auto result = std::get_if<double>(&found->second)) {
    return *result;
  } else {
    throw std::runtime_error("The value at key \"" + key + "\" is not a double!");
  }
}
bool AnyMap::getBoolean(const std::string& key) const {
  auto found = _map.find(key);
  if (found == _map.end()) {
    throw std::runtime_error("The key \"" + key + "\" does not exist in this Map!");
  }
  if (auto result = std::get_if<bool>(&found->second)) {
    return *result;
  } else {
    throw std::runtime_error("The value at key \"" + key + "\" is not a bool!");
  }
}
int64_t AnyMap::getBigInt(const std::string& key) const {
  auto found = _map.find(key);
  if (found == _map.end()) {
    throw std::runtime_error("The key \"" + key + "\" does not exist in this Map!");
  }
  if (auto result = std::get_if<int64_t>(&found->second)) {
    return *result;
  } else {
    throw std::runtime_error("The value at key \"" + key + "\" is not a bigint!");
  }
}
std::string AnyMap::getString(const std::string& key) const {
  auto found = _map.find(key);
  if (found == _map.end()) {
    throw std::runtime_error("The key \"" + key + "\" does not exist in this Map!");
  }
  if (auto result = std::get_if<std::string>(&found->second)) {
    return *result;
  } else {
    throw std::runtime_error("The value at key \"" + key + "\" is not a string!");
  }
}
AnyArray AnyMap::getArray(const std::string& key) const {
  auto found = _map.find(key);
  if (found == _map.end()) {
    throw std::runtime_error("The key \"" + key + "\" does not exist in this Map!");
  }
  if (auto result = std::get_if<AnyArray>(&found->second)) {
    return *result;
  } else {
    throw std::runtime_error("The value at key \"" + key + "\" is not an array!");
  }
}
AnyObject AnyMap::getObject(const std::string& key) const {
  auto found = _map.find(key);
  if (found == _map.end()) {
    throw std::runtime_error("The key \"" + key + "\" does not exist in this Map!");
  }
  if (auto result = std::get_if<AnyObject>(&found->second)) {
    return *result;
  } else {
    throw std::runtime_error("The value at key \"" + key + "\" is not an object!");
  }
}

// Set
void AnyMap::setNull(const std::string& key) {
  _map.emplace(key, std::monostate());
}
void AnyMap::setDouble(const std::string& key, double value) {
  _map.emplace(key, value);
}
void AnyMap::setBoolean(const std::string& key, bool value) {
  _map.emplace(key, value);
}
void AnyMap::setBigInt(const std::string& key, int64_t value) {
  _map.emplace(key, value);
}
void AnyMap::setString(const std::string& key, const std::string& value) {
  _map.emplace(key, value);
}
void AnyMap::setArray(const std::string& key, const AnyArray& value) {
  _map.emplace(key, value);
}
void AnyMap::setObject(const std::string& key, const AnyObject& value) {
  _map.emplace(key, value);
}
void AnyMap::setAny(const std::string& key, const AnyValue& value) {
  _map.emplace(key, value);
}

// C++ getter
const std::unordered_map<std::string, AnyValue>& AnyMap::getMap() const {
  return _map;
}

} // namespace margelo::nitro
