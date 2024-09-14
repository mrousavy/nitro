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
   * Create a new `JAnyMap` from an existing `AnyMap`.
   */
  static jni::local_ref<JAnyMap::javaobject> create(const std::shared_ptr<AnyMap>& map) {
    return newObjectCxxArgs(map);
  }
    /**
     * Create a new `JAnyMap` with the given pre-allocated size.
     */
    static jni::local_ref<JAnyMap::javaobject> create(size_t size) {
        return newObjectCxxArgs(size);
    }

private:
  explicit JAnyMap() {
    auto map = jni::JHashMap<jni::JString, jni::JObject>::create();
    _map = jni::make_global(map);
  }
  explicit JAnyMap(size_t size) {
    auto map = jni::JHashMap<jni::JString, jni::JObject>::create(size);
    _map = jni::make_global(map);
  }
  explicit JAnyMap(const std::shared_ptr<AnyMap>& map) {
    // TODO: Implement c++ -> java
    throw std::runtime_error("Cannot create a JAnyMap from a C++ AnyMap yet!");
  }

public:
  bool contains(const std::string& key) {
    static const auto method = _map->javaClassStatic()->getMethod<jboolean(jni::local_ref<jni::JObject>)>("containsKey");
    return method(_map, jni::make_jstring(key));
  }
  void remove(const std::string& key) {
    static const auto method = _map->javaClassStatic()->getMethod<void(jni::local_ref<jni::JObject>)>("remove");
    method(_map, jni::make_jstring(key));
  }
  void clear() {
    static const auto method = _map->javaClassStatic()->getMethod<void()>("clear");
    method(_map);
  }

private:
  jni::local_ref<jni::JObject> get(const jni::alias_ref<jni::JString>& key) {
    static const auto method = _map->javaClassStatic()->getMethod<jni::JObject(jni::alias_ref<jni::JObject>)>("get");
    return method(_map, key);
  }

public:
  bool isNull(const jni::alias_ref<jni::JString>& key) {
    jni::local_ref<jni::JObject> result = get(key);
    return result == nullptr;
  }
  bool isDouble(const jni::alias_ref<jni::JString>& key) {
    static const auto doubleClass = jni::JDouble::javaClassStatic();
    jni::local_ref<jni::JObject> result = get(key);
    return result->isInstanceOf(doubleClass);
  }
  bool isBoolean(const jni::alias_ref<jni::JString>& key) {
    static const auto booleanClass = jni::JBoolean::javaClassStatic();
    jni::local_ref<jni::JObject> result = get(key);
    return result->isInstanceOf(booleanClass);
  }
  bool isBigInt(const jni::alias_ref<jni::JString>& key) {
    static const auto longClass = jni::JLong::javaClassStatic();
    jni::local_ref<jni::JObject> result = get(key);
    return result->isInstanceOf(longClass);
  }
  bool isString(const jni::alias_ref<jni::JString>& key) {
    static const auto stringClass = jni::JString::javaClassStatic();
    jni::local_ref<jni::JObject> result = get(key);
    return result->isInstanceOf(stringClass);
  }
  bool isArray(const jni::alias_ref<jni::JString>& key) {
    static const auto arrayClass = jni::JArrayClass<jni::JObject>::javaClassStatic();
    jni::local_ref<jni::JObject> result = get(key);
    return result->isInstanceOf(arrayClass);
  }
  bool isObject(const jni::alias_ref<jni::JString>& key) {
    static const auto mapClass = jni::JMap<jni::JObject, jni::JObject>::javaClassStatic();
    jni::local_ref<jni::JObject> result = get(key);
    return result->isInstanceOf(mapClass);
  }

public:
  jni::local_ref<jni::JDouble> getDouble(const jni::alias_ref<jni::JString>& key) {
    jni::local_ref<jni::JObject> result = get(key);
    return jni::static_ref_cast<jni::JDouble>(result);
  }
  jni::local_ref<jni::JBoolean> getBoolean(const jni::alias_ref<jni::JString>& key) {
    jni::local_ref<jni::JObject> result = get(key);
    return jni::static_ref_cast<jni::JBoolean>(result);
  }
  jni::local_ref<jni::JLong> getBigInt(const jni::alias_ref<jni::JString>& key) {
    jni::local_ref<jni::JObject> result = get(key);
    return jni::static_ref_cast<jni::JLong>(result);
  }
  jni::local_ref<jni::JString> getString(const jni::alias_ref<jni::JString>& key) {
    jni::local_ref<jni::JObject> result = get(key);
    return jni::static_ref_cast<jni::JString>(result);
  }
  jni::local_ref<jni::JArrayClass<jni::JObject>> getAnyArray(const jni::alias_ref<jni::JString>& key) {
    jni::local_ref<jni::JObject> result = get(key);
    return jni::static_ref_cast<jni::JArrayClass<jni::JObject>>(result);
  }
  jni::local_ref<jni::JMap<jni::JString, jni::JObject>> getAnyObject(const jni::alias_ref<jni::JString>& key) {
    jni::local_ref<jni::JObject> result = get(key);
    return jni::static_ref_cast<jni::JMap<jni::JString, jni::JObject>>(result);
  }

public:
  void setNull(const jni::alias_ref<jni::JString>& key) {
    _map->put(key, nullptr);
  }
    void setDouble(const jni::alias_ref<jni::JString>& key, double value) {
        _map->put(key, jni::autobox(value));
    }
    void setBoolean(const jni::alias_ref<jni::JString>& key, bool value) {
        _map->put(key, jni::autobox(value));
    }
    void setBigInt(const jni::alias_ref<jni::JString>& key, int64_t value) {
        _map->put(key, jni::autobox(value));
    }
  void setString(const jni::alias_ref<jni::JString>& key, const jni::alias_ref<jni::JString>& value) {
    _map->put(key, value);
  }
  void setAnyArray(const jni::alias_ref<jni::JString>& key, jni::alias_ref<jni::JArrayClass<jni::JObject>> value) {
    _map->put(key, value);
  }
  void setAnyObject(const jni::alias_ref<jni::JString>& key, jni::alias_ref<jni::JMap<jni::JString, jni::JObject>> value) {
    _map->put(key, value);
  }

public:
  jni::global_ref<jni::JHashMap<jni::JString, jni::JObject>> getJavaMap() {
    return _map;
  }

public:
  std::shared_ptr<AnyMap> getMap() const {
    // TODO: java -> c++
    throw std::runtime_error("JAnyMap cannot be converted to C++ AnyMap yet!");
  }

private:
  friend HybridBase;
  using HybridBase::HybridBase;
  jni::global_ref<jni::JHashMap<jni::JString, jni::JObject>> _map;

public:
  static void registerNatives() {
    registerHybrid({
        // init
        makeNativeMethod("initHybrid", JAnyMap::initHybrid),
        makeNativeMethod("getJavaMap", JAnyMap::getJavaMap),
        // helpers
        makeNativeMethod("contains", JAnyMap::contains),
        makeNativeMethod("remove", JAnyMap::remove),
        makeNativeMethod("clear", JAnyMap::clear),
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
        // set
        makeNativeMethod("setNull", JAnyMap::setNull),
        makeNativeMethod("setDouble", JAnyMap::setDouble),
        makeNativeMethod("setBoolean", JAnyMap::setBoolean),
        makeNativeMethod("setBigInt", JAnyMap::setBigInt),
        makeNativeMethod("setString", JAnyMap::setString),
        makeNativeMethod("setAnyArray", JAnyMap::setAnyArray),
        makeNativeMethod("setAnyObject", JAnyMap::setAnyObject),
    });
  }
};

} // namespace margelo::nitro
