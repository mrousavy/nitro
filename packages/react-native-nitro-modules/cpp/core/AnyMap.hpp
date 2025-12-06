//
// Created by Marc Rousavy on 30.07.24.
//

#pragma once

#include "NitroDefines.hpp"
#include "Null.hpp"
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

using VariantType = std::variant<NullType, bool, double, int64_t, std::string, AnyArray, AnyObject>;
struct AnyValue : VariantType {
  using VariantType::variant;

  AnyValue(const VariantType& variant) : VariantType(variant) {}
  AnyValue(VariantType&& variant) : VariantType(std::move(variant)) {}
};

/**
 * Type tags for AnyValue - used for single-call type+value extraction.
 * This avoids the need for multiple JNI/bridge calls to check type then get value.
 */
enum class AnyValueType : int {
  Null = 0,
  Boolean = 1,
  Double = 2,
  BigInt = 3,
  String = 4,
  Array = 5,
  Object = 6
};

/**
 * A typed value that contains both the type tag and the value.
 * This allows extracting type+value in a single call, avoiding
 * sequential isX() + getX() calls.
 */
struct TypedAnyValue {
  AnyValueType type;
  // Primitive values stored inline
  bool boolValue;
  double doubleValue;
  int64_t bigintValue;
  // Complex values (only one is valid based on type)
  std::string stringValue;
  AnyArray arrayValue;
  AnyObject objectValue;

  TypedAnyValue() : type(AnyValueType::Null), boolValue(false), doubleValue(0), bigintValue(0) {}

  static TypedAnyValue fromAnyValue(const AnyValue& value) {
    TypedAnyValue result;
    if (std::holds_alternative<NullType>(value)) {
      result.type = AnyValueType::Null;
    } else if (std::holds_alternative<bool>(value)) {
      result.type = AnyValueType::Boolean;
      result.boolValue = std::get<bool>(value);
    } else if (std::holds_alternative<double>(value)) {
      result.type = AnyValueType::Double;
      result.doubleValue = std::get<double>(value);
    } else if (std::holds_alternative<int64_t>(value)) {
      result.type = AnyValueType::BigInt;
      result.bigintValue = std::get<int64_t>(value);
    } else if (std::holds_alternative<std::string>(value)) {
      result.type = AnyValueType::String;
      result.stringValue = std::get<std::string>(value);
    } else if (std::holds_alternative<AnyArray>(value)) {
      result.type = AnyValueType::Array;
      result.arrayValue = std::get<AnyArray>(value);
    } else if (std::holds_alternative<AnyObject>(value)) {
      result.type = AnyValueType::Object;
      result.objectValue = std::get<AnyObject>(value);
    }
    return result;
  }

  AnyValue toAnyValue() const {
    switch (type) {
      case AnyValueType::Null:
        return AnyValue(nitro::null);
      case AnyValueType::Boolean:
        return AnyValue(boolValue);
      case AnyValueType::Double:
        return AnyValue(doubleValue);
      case AnyValueType::BigInt:
        return AnyValue(bigintValue);
      case AnyValueType::String:
        return AnyValue(stringValue);
      case AnyValueType::Array:
        return AnyValue(arrayValue);
      case AnyValueType::Object:
        return AnyValue(objectValue);
      default:
        return AnyValue(nitro::null);
    }
  }
};

/**
 * Get the type tag for an AnyValue without extracting the value.
 */
inline AnyValueType getAnyValueType(const AnyValue& value) {
  if (std::holds_alternative<NullType>(value)) return AnyValueType::Null;
  if (std::holds_alternative<bool>(value)) return AnyValueType::Boolean;
  if (std::holds_alternative<double>(value)) return AnyValueType::Double;
  if (std::holds_alternative<int64_t>(value)) return AnyValueType::BigInt;
  if (std::holds_alternative<std::string>(value)) return AnyValueType::String;
  if (std::holds_alternative<AnyArray>(value)) return AnyValueType::Array;
  if (std::holds_alternative<AnyObject>(value)) return AnyValueType::Object;
  return AnyValueType::Null;
}

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
private:
  explicit AnyMap() {}
  AnyMap(size_t size) {
    _map.reserve(size);
  }

public:
  /**
   * Create a new `shared_ptr` instance of AnyMap.
   */
  static std::shared_ptr<AnyMap> make() {
    return std::shared_ptr<AnyMap>(new AnyMap());
  }
  /**
   * Create a new `shared_ptr` instance of AnyMap with the given amount of spaces pre-allocated.
   */
  static std::shared_ptr<AnyMap> make(size_t size) {
    return std::shared_ptr<AnyMap>(new AnyMap(size));
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
  /**
   * Get all keys this `AnyMap` instance contains.
   */
  std::vector<std::string> getAllKeys() const;

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
  NullType getNull(const std::string& key) const;
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

  /**
   * Get the value at the given `key` as it's boxed `AnyValue`.
   * If no object value exists at the given `key`, this method will throw.
   */
  AnyValue getAny(const std::string& key) const;

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

public:
  /**
   * Merge all keys and values from given `other` `AnyMap` into this `AnyMap`.
   */
  void merge(const std::shared_ptr<AnyMap>& other);

public:
  // These methods reduce JNI/bridge calls by doing bulk operations

  /**
   * Get the type tag for a value at the given key.
   * Returns the type without extracting the value - useful for type dispatch.
   */
  AnyValueType getType(const std::string& key) const;

  /**
   * Get a typed value containing both type tag and value in a single call.
   * This avoids the sequential isX() + getX() pattern that requires 2+ calls.
   */
  TypedAnyValue getTypedValue(const std::string& key) const;

  /**
   * Get all keys and their type tags in a single call.
   * Useful for iterating over the map without multiple type checks.
   */
  std::vector<std::pair<std::string, AnyValueType>> getAllKeysWithTypes() const;

  /**
   * Set a value from a TypedAnyValue in a single call.
   */
  void setTypedValue(const std::string& key, const TypedAnyValue& value);

  /**
   * Get the size of the map.
   */
  size_t size() const noexcept;

private:
  std::unordered_map<std::string, AnyValue> _map;
} SWIFT_NONCOPYABLE;

} // namespace margelo::nitro
