//
//  JAnyMap.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#pragma once

#include "AnyMap.hpp"
#include "JAnyValue.hpp"
#include <fbjni/fbjni.h>

namespace margelo::nitro {

using namespace facebook;

/**
 * Represents an `AnyMap` implemented in Java.
 */
class JAnyMap final : public jni::HybridClass<JAnyMap> {
public:
  static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/core/AnyMap;";

public:
  /**
   * Create a new, empty `AnyMap` from Java.
   */
  static jni::local_ref<JAnyMap::jhybriddata> initHybrid(jni::alias_ref<jhybridobject>) {
    return makeCxxInstance();
  }
  /**
   * Create a new, empty `AnyMap` with the given preallocated size from Java.
   */
  static jni::local_ref<JAnyMap::jhybriddata> initHybridPreallocatedSize(jni::alias_ref<jhybridobject>, jint preallocatedSize) {
    return makeCxxInstance(preallocatedSize);
  }
  /**
   * Create a new `JAnyMap` from an existing `AnyMap`.
   */
  static jni::local_ref<JAnyMap::javaobject> create(const std::shared_ptr<AnyMap>& map) {
    return newObjectCxxArgs(map);
  }

private:
  JAnyMap() {
    _map = AnyMap::make();
  }
  JAnyMap(jint preallocatedSize) {
    _map = AnyMap::make(static_cast<size_t>(preallocatedSize));
  }
  explicit JAnyMap(const std::shared_ptr<AnyMap>& map) : _map(map) {}

protected:
  bool contains(const std::string& key) {
    return _map->contains(key);
  }
  void remove(const std::string& key) {
    _map->remove(key);
  }
  void clear() {
    _map->clear();
  }
  jni::local_ref<jni::JArrayClass<jni::JString>> getAllKeys() {
    auto& map = _map->getMap();
    auto array = jni::JArrayClass<jni::JString>::newArray(map.size());
    size_t index = 0;
    for (const auto& pair : map) {
      auto jKey = jni::make_jstring(pair.first);
      array->setElement(index, *jKey);
      index++;
    }
    return array;
  }

protected:
  bool isNull(const std::string& key) {
    return _map->isNull(key);
  }
  bool isDouble(const std::string& key) {
    return _map->isDouble(key);
  }
  bool isBoolean(const std::string& key) {
    return _map->isBoolean(key);
  }
  bool isBigInt(const std::string& key) {
    return _map->isBigInt(key);
  }
  bool isString(const std::string& key) {
    return _map->isString(key);
  }
  bool isArray(const std::string& key) {
    return _map->isArray(key);
  }
  bool isObject(const std::string& key) {
    return _map->isObject(key);
  }

protected:
  double getDouble(const std::string& key) {
    return _map->getDouble(key);
  }
  bool getBoolean(const std::string& key) {
    return _map->getBoolean(key);
  }
  int64_t getBigInt(const std::string& key) {
    return _map->getBigInt(key);
  }
  std::string getString(const std::string& key) {
    return _map->getString(key);
  }
  jni::local_ref<JAnyArray> getAnyArray(const std::string& key) {
    const auto& vector = _map->getArray(key);
    auto javaArray = jni::JArrayClass<JAnyValue::javaobject>::newArray(vector.size());
    for (size_t i = 0; i < vector.size(); i++) {
      auto value = JAnyValue::create(vector[i]);
      javaArray->setElement(i, value.get());
    }
    return javaArray;
  }
  jni::local_ref<JAnyObject> getAnyObject(const std::string& key) {
    const auto& map = _map->getObject(key);
    auto javaMap = jni::JHashMap<jni::JString, JAnyValue::javaobject>::create(map.size());
    for (const auto& entry : map) {
      auto string = jni::make_jstring(entry.first);
      auto value = JAnyValue::create(entry.second);
      javaMap->put(string, value);
    }
    return javaMap;
  }
  jni::local_ref<JAnyValue::javaobject> getAnyValue(const std::string& key) {
    const auto& any = _map->getAny(key);
    return JAnyValue::create(any);
  }

protected:
  void setNull(const std::string& key) {
    _map->setNull(key);
  }
  void setDouble(const std::string& key, double value) {
    _map->setDouble(key, value);
  }
  void setBoolean(const std::string& key, bool value) {
    _map->setBoolean(key, value);
  }
  void setBigInt(const std::string& key, int64_t value) {
    _map->setBigInt(key, value);
  }
  void setString(const std::string& key, const std::string& value) {
    _map->setString(key, value);
  }
  void setAnyArray(const std::string& key, jni::alias_ref<JAnyArray> value) {
    std::vector<AnyValue> vector;
    size_t size = value->size();
    vector.reserve(size);
    for (size_t i = 0; i < size; i++) {
      auto anyValue = value->getElement(i);
      vector.push_back(anyValue->cthis()->getValue());
    }
    _map->setArray(key, vector);
  }
  void setAnyObject(const std::string& key, const jni::alias_ref<JAnyObject>& value) {
    std::unordered_map<std::string, AnyValue> map;
    map.reserve(value->size());
    for (const auto& entry : *value) {
      map.emplace(entry.first->toStdString(), entry.second->cthis()->getValue());
    }
    _map->setObject(key, map);
  }
  void setAnyValue(const std::string& key, const jni::alias_ref<JAnyValue::javaobject>& value) {
    _map->setAny(key, value->cthis()->getValue());
  }

protected:
  void merge(jni::alias_ref<JAnyMap::javaobject> other) {
    _map->merge(other->cthis()->_map);
  }


  /**
   * Get the type tag for a value at the given key.
   * Returns: 0=null, 1=boolean, 2=double, 3=bigint, 4=string, 5=array, 6=object
   */
  jint getType(const std::string& key) {
    return static_cast<jint>(_map->getType(key));
  }

  /**
   * Get the size of the map in a single call.
   */
  jint getSize() {
    return static_cast<jint>(_map->size());
  }

  /**
   * Get all keys with their type tags in a single JNI call.
   * Returns an array of [key1, type1, key2, type2, ...] where type is the string representation of the type tag.
   */
  jni::local_ref<jni::JArrayClass<jni::JString>> getAllKeysWithTypes() {
    auto keysWithTypes = _map->getAllKeysWithTypes();
    auto array = jni::JArrayClass<jni::JString>::newArray(keysWithTypes.size() * 2);
    size_t index = 0;
    for (const auto& pair : keysWithTypes) {
      auto jKey = jni::make_jstring(pair.first);
      auto jType = jni::make_jstring(std::to_string(static_cast<int>(pair.second)));
      array->setElement(index++, *jKey);
      array->setElement(index++, *jType);
    }
    return array;
  }

  /**
   * Batch get: Returns primitive values for all keys in a single call.
   * For primitives (null, bool, double, bigint), values are directly in the result.
   * For complex types (string, array, object), only type tag is provided.
   * Returns: Array of [key, typeTag, value (as string), ...] triplets
   */
  jni::local_ref<jni::JArrayClass<jni::JString>> getAllPrimitiveValues() {
    std::vector<std::string> result;
    result.reserve(_map->size() * 3);

    for (const auto& pair : _map->getMap()) {
      result.push_back(pair.first); // key
      auto typeTag = getAnyValueType(pair.second);
      result.push_back(std::to_string(static_cast<int>(typeTag))); // type

      // Value as string for primitives
      switch (typeTag) {
        case AnyValueType::Null:
          result.push_back("null");
          break;
        case AnyValueType::Boolean:
          result.push_back(std::get<bool>(pair.second) ? "true" : "false");
          break;
        case AnyValueType::Double:
          result.push_back(std::to_string(std::get<double>(pair.second)));
          break;
        case AnyValueType::BigInt:
          result.push_back(std::to_string(std::get<int64_t>(pair.second)));
          break;
        case AnyValueType::String:
          result.push_back(std::get<std::string>(pair.second));
          break;
        case AnyValueType::Array:
        case AnyValueType::Object:
          result.push_back(""); // Complex types need separate calls
          break;
      }
    }

    auto array = jni::JArrayClass<jni::JString>::newArray(result.size());
    for (size_t i = 0; i < result.size(); i++) {
      auto jStr = jni::make_jstring(result[i]);
      array->setElement(i, *jStr);
    }
    return array;
  }

public:
  [[nodiscard]]
  std::shared_ptr<AnyMap> getMap() const {
    return _map;
  }

private:
  friend HybridBase;
  using HybridBase::HybridBase;
  std::shared_ptr<AnyMap> _map;

public:
  static void registerNatives() {
    registerHybrid({
        // init
        makeNativeMethod("initHybrid", JAnyMap::initHybrid),
        makeNativeMethod("initHybrid", JAnyMap::initHybridPreallocatedSize),
        // helpers
        makeNativeMethod("contains", JAnyMap::contains),
        makeNativeMethod("remove", JAnyMap::remove),
        makeNativeMethod("clear", JAnyMap::clear),
        makeNativeMethod("getAllKeys", JAnyMap::getAllKeys),
        // is
        makeNativeMethod("isNull", JAnyMap::isNull),
        makeNativeMethod("isDouble", JAnyMap::isDouble),
        makeNativeMethod("isBoolean", JAnyMap::isBoolean),
        makeNativeMethod("isBigInt", JAnyMap::isBigInt),
        makeNativeMethod("isString", JAnyMap::isString),
        makeNativeMethod("isArray", JAnyMap::isArray),
        makeNativeMethod("isObject", JAnyMap::isObject),
        // get
        makeNativeMethod("getDouble", JAnyMap::getDouble),
        makeNativeMethod("getBoolean", JAnyMap::getBoolean),
        makeNativeMethod("getBigInt", JAnyMap::getBigInt),
        makeNativeMethod("getString", JAnyMap::getString),
        makeNativeMethod("getAnyArray", JAnyMap::getAnyArray),
        makeNativeMethod("getAnyObject", JAnyMap::getAnyObject),
        makeNativeMethod("getAnyValue", JAnyMap::getAnyValue),
        // set
        makeNativeMethod("setNull", JAnyMap::setNull),
        makeNativeMethod("setDouble", JAnyMap::setDouble),
        makeNativeMethod("setBoolean", JAnyMap::setBoolean),
        makeNativeMethod("setBigInt", JAnyMap::setBigInt),
        makeNativeMethod("setString", JAnyMap::setString),
        makeNativeMethod("setAnyArray", JAnyMap::setAnyArray),
        makeNativeMethod("setAnyObject", JAnyMap::setAnyObject),
        makeNativeMethod("setAnyValue", JAnyMap::setAnyValue),
        // merge
        makeNativeMethod("merge", JAnyMap::merge),
        makeNativeMethod("getType", JAnyMap::getType),
        makeNativeMethod("getSize", JAnyMap::getSize),
        makeNativeMethod("getAllKeysWithTypes", JAnyMap::getAllKeysWithTypes),
        makeNativeMethod("getAllPrimitiveValues", JAnyMap::getAllPrimitiveValues),
    });
  }
};

} // namespace margelo::nitro
