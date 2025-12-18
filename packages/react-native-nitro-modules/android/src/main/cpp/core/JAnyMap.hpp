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

// Pre declre functions for recursive conversion
jni::local_ref<jni::JArrayList<jni::JObject>> anyArrayToJList(const AnyArray& array);
jni::local_ref<jni::JHashMap<jni::JString, jni::JObject>> anyObjectToJHashMap(const AnyObject& object);

// Convert AnyValue to boxed Java Object (null, Double, Boolean, Long, String, ArrayList, HashMap)
inline jni::local_ref<jni::JObject> anyValueToJObject(const AnyValue& value) {
  if (std::holds_alternative<NullType>(value)) {
    return nullptr;
  } else if (std::holds_alternative<double>(value)) {
    return jni::JDouble::valueOf(std::get<double>(value));
  } else if (std::holds_alternative<bool>(value)) {
    return jni::JBoolean::valueOf(std::get<bool>(value));
  } else if (std::holds_alternative<int64_t>(value)) {
    return jni::JLong::valueOf(std::get<int64_t>(value));
  } else if (std::holds_alternative<std::string>(value)) {
    return jni::make_jstring(std::get<std::string>(value));
  } else if (std::holds_alternative<AnyArray>(value)) {
    return jni::static_ref_cast<jni::JObject>(anyArrayToJList(std::get<AnyArray>(value)));
  } else if (std::holds_alternative<AnyObject>(value)) {
    return jni::static_ref_cast<jni::JObject>(anyObjectToJHashMap(std::get<AnyObject>(value)));
  }
  return nullptr;
}

inline jni::local_ref<jni::JArrayList<jni::JObject>> anyArrayToJList(const AnyArray& array) {
  auto jList = jni::JArrayList<jni::JObject>::create(static_cast<int>(array.size()));
  for (const auto& item : array) {
    jList->add(anyValueToJObject(item));
  }
  return jList;
}

inline jni::local_ref<jni::JHashMap<jni::JString, jni::JObject>> anyObjectToJHashMap(const AnyObject& object) {
  auto jMap = jni::JHashMap<jni::JString, jni::JObject>::create(object.size());
  for (const auto& [key, val] : object) {
    jMap->put(jni::make_jstring(key), anyValueToJObject(val));
  }
  return jMap;
}

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
   * Convert the entire AnyMap to a Java HashMap<String, Object> in a single JNI call.
   * This is much faster than iterating in Kotlin and making multiple JNI calls per entry.
   */
  jni::local_ref<jni::JHashMap<jni::JString, jni::JObject>> toHashMapNative() {
    const auto& map = _map->getMap();
    auto javaMap = jni::JHashMap<jni::JString, jni::JObject>::create(map.size());
    for (const auto& [key, value] : map) {
      javaMap->put(jni::make_jstring(key), anyValueToJObject(value));
    }
    return javaMap;
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
        // bulk conversion
        makeNativeMethod("toHashMapNative", JAnyMap::toHashMapNative),
    });
  }
};

} // namespace margelo::nitro