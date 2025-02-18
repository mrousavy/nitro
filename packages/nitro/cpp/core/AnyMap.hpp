//
// Created by Marc Rousavy on 30.07.24.
//

#pragma once

#include "NitroDefines.hpp"
#include <map>
#include <memory>
#include <string>
#include <unordered_map>
#include <variant>
#include <vector>

namespace margelo::nitro {

struct AnyValue;
using AnyArray = std::vector<AnyValue>;
using AnyObject = std::unordered_map<std::string, AnyValue>;

using VariantType = std::variant<std::monostate, bool, double, int64_t, std::string, AnyArray, AnyObject>;
struct AnyValue : VariantType {
  using VariantType::variant;

  AnyValue(const VariantType& variant) : VariantType(variant) {}
  AnyValue(VariantType&& variant) : VariantType(std::move(variant)) {}
};

/**
 * Represents a JS map-like object (`Record<K, V>`).
 * This is essentially a wrapper around `std::unordered_map<string, variant<...>>`.
 *
 * Supported values are:
 * 1. Primitives
 * 2. Arrays of primitives
 * 3. Objects of primitives
 */
class AnyMap final {
public:
  /**
   * Create a new instance of AnyMap.
   */
  explicit AnyMap() {}
  /**
   * Create a new instance of AnyMap with the given amount of spaces pre-allocated.
   */
  explicit AnyMap(size_t size) {
    _map.reserve(size);
  }

public:
  /**
   * Create a new `shared_ptr` instance of AnyMap.
   */
  static std::shared_ptr<AnyMap> make() {
    return std::make_shared<AnyMap>();
  }
  /**
   * Create a new `shared_ptr` instance of AnyMap with the given amount of spaces pre-allocated.
   */
  static std::shared_ptr<AnyMap> make(size_t size) {
    return std::make_shared<AnyMap>(size);
  }

public:
  /**
   * Returns whether the map contains the given key, or not.
   */
  bool contains(const std::string& key) const;
  /**
   * Removes the given key from the map, leaving no value.
   */
  void remove(const std::string& key);
  /**
   * Deletes all keys and values inside the map.
   */
  void clear() noexcept;

public:
  /**
   * Returns whether the value under the given key is a `null`.
   * If the value is not a `null` (or there is no value at the given `key`), this returns `false`.
   */
  bool isNull(const std::string& key) const;
  /**
   * Returns whether the value under the given key is a `double`.
   * If the value is not a `double` (or there is no value at the given `key`), this returns `false`.
   */
  bool isDouble(const std::string& key) const;
  /**
   * Returns whether the value under the given key is a `boolean`.
   * If the value is not a `boolean` (or there is no value at the given `key`), this returns `false`.
   */
  bool isBoolean(const std::string& key) const;
  /**
   * Returns whether the value under the given key is a `bigint`.
   * If the value is not a `bigint` (or there is no value at the given `key`), this returns `false`.
   */
  bool isBigInt(const std::string& key) const;
  /**
   * Returns whether the value under the given key is a `string`.
   * If the value is not a `string` (or there is no value at the given `key`), this returns `false`.
   */
  bool isString(const std::string& key) const;
  /**
   * Returns whether the value under the given key is an array.
   * If the value is not an array (or there is no value at the given `key`), this returns `false`.
   */
  bool isArray(const std::string& key) const;
  /**
   * Returns whether the value under the given key is an object.
   * If the value is not an object (or there is no value at the given `key`), this returns `false`.
   */
  bool isObject(const std::string& key) const;

public:
  /**
   * Returns the null value at the given `key`.
   * If no `null` value exists at the given `key`, this method will throw.
   */
  std::monostate getNull(const std::string& key) const;
  /**
   * Returns the double value at the given `key`.
   * If no `double` value exists at the given `key`, this method will throw.
   */
  double getDouble(const std::string& key) const;
  /**
   * Returns the boolean value at the given `key`.
   * If no `boolean` value exists at the given `key`, this method will throw.
   */
  bool getBoolean(const std::string& key) const;
  /**
   * Returns the bigint value at the given `key`.
   * If no `bigint` value exists at the given `key`, this method will throw.
   */
  int64_t getBigInt(const std::string& key) const;
  /**
   * Returns the string value at the given `key`.
   * If no `string` value exists at the given `key`, this method will throw.
   */
  std::string getString(const std::string& key) const;
  /**
   * Returns the array value at the given `key`.
   * If no array value exists at the given `key`, this method will throw.
   */
  AnyArray getArray(const std::string& key) const;
  /**
   * Returns the object value at the given `key`.
   * If no object value exists at the given `key`, this method will throw.
   */
  AnyObject getObject(const std::string& key) const;

public:
  /**
   * Set the value at the given key to `null`.
   * If the key already exists, this will overwrite the value at that `key`.
   */
  void setNull(const std::string& key);
  /**
   * Set the value at the given key to the given `double`.
   * If the key already exists, this will overwrite the value at that `key`.
   */
  void setDouble(const std::string& key, double value);
  /**
   * Set the value at the given key to the given `boolean`.
   * If the key already exists, this will overwrite the value at that `key`.
   */
  void setBoolean(const std::string& key, bool value);
  /**
   * Set the value at the given key to the given `bigint`.
   * If the key already exists, this will overwrite the value at that `key`.
   */
  void setBigInt(const std::string& key, int64_t value);
  /**
   * Set the value at the given key to the given `string`.
   * If the key already exists, this will overwrite the value at that `key`.
   */
  void setString(const std::string& key, const std::string& value);
  /**
   * Set the value at the given key to the given array.
   * If the key already exists, this will overwrite the value at that `key`.
   */
  void setArray(const std::string& key, const AnyArray& value);
  /**
   * Set the value at the given key to the given object.
   * If the key already exists, this will overwrite the value at that `key`.
   */
  void setObject(const std::string& key, const AnyObject& value);
  /**
   * Set the value at the given key to the given `AnyValue`.
   * If the key already exists, this will overwrite the value at that `key`.
   */
  void setAny(const std::string& key, const AnyValue& value);

public:
  /**
   * Get the actual C++ map that holds all keys and variant values.
   */
  const std::unordered_map<std::string, AnyValue>& getMap() const;

private:
  std::unordered_map<std::string, AnyValue> _map;
} SWIFT_NONCOPYABLE;

} // namespace margelo::nitro
