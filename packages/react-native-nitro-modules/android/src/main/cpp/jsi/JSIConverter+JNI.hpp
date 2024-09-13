//
// Created by Marc Rousavy on 21.02.24.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
template <typename T, typename Enable>
struct JSIConverter;
} // namespace margelo::nitro

#include "JSIConverter.hpp"
#include <fbjni/fbjni.h>
#include <jni.h>
#include <jsi/jsi.h>
#include <type_traits>
#include <variant>

namespace margelo::nitro {

using namespace facebook;

// number? <> JDouble?
template <>
struct JSIConverter<jni::alias_ref<jni::JDouble>> final {
  static inline jni::local_ref<jni::JDouble> fromJSI(jsi::Runtime&, const jsi::Value& arg) {
    if (arg.isUndefined() || arg.isNull()) {
      return nullptr;
    } else {
      return jni::JDouble::valueOf(arg.asNumber());
    }
  }
  static inline jsi::Value toJSI(jsi::Runtime&, const jni::alias_ref<jni::JDouble>& arg) {
    if (arg == nullptr) {
      return jsi::Value::undefined();
    } else {
      return jsi::Value(arg->value());
    }
  }
  static inline bool canConvert(jsi::Runtime&, const jsi::Value& value) {
    return value.isUndefined() || value.isNull() || value.isNumber();
  }
};

// boolean? <> JBoolean?
template <>
struct JSIConverter<jni::alias_ref<jni::JBoolean>> final {
  static inline jni::local_ref<jni::JBoolean> fromJSI(jsi::Runtime&, const jsi::Value& arg) {
    if (arg.isUndefined() || arg.isNull()) {
      return nullptr;
    } else {
      return jni::JBoolean::valueOf(arg.asBool());
    }
  }
  static inline jsi::Value toJSI(jsi::Runtime&, const jni::alias_ref<jni::JBoolean>& arg) {
    if (arg == nullptr) {
      return jsi::Value::undefined();
    } else {
      return jsi::Value(arg->value());
    }
  }
  static inline bool canConvert(jsi::Runtime&, const jsi::Value& value) {
    return value.isUndefined() || value.isNull() || value.isBool();
  }
};

// bigint? <> JLong?
template <>
struct JSIConverter<jni::alias_ref<jni::JLong>> final {
  static inline jni::local_ref<jni::JLong> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    if (arg.isUndefined() || arg.isNull()) {
      return nullptr;
    } else {
      return jni::JLong::valueOf(arg.asBigInt(runtime).asInt64(runtime));
    }
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, const jni::alias_ref<jni::JLong>& arg) {
    if (arg == nullptr) {
      return jsi::Value::undefined();
    } else {
      return jsi::BigInt::fromInt64(runtime, arg->value());
    }
  }
  static inline bool canConvert(jsi::Runtime&, const jsi::Value& value) {
    return value.isUndefined() || value.isNull() || value.isBigInt();
  }
};

// string <> JString
template <>
struct JSIConverter<jni::alias_ref<jni::JString>> final {
  static inline jni::local_ref<jni::JString> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    return jni::make_jstring(arg.asString(runtime).utf8(runtime));
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, const jni::alias_ref<jni::JString>& arg) {
    return jsi::String::createFromUtf8(runtime, arg->toStdString());
  }
  static inline bool canConvert(jsi::Runtime&, const jsi::Value& value) {
    return value.isString();
  }
};

// [] <> JArray
template <typename T>
struct JSIConverter<jni::alias_ref<jni::JArrayClass<T>>> final {
  static inline jni::local_ref<jni::JArrayClass<T>> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    jsi::Object object = arg.asObject(runtime);
    jsi::Array array = object.asArray(runtime);
    size_t size = array.size(runtime);
    jni::local_ref<jni::JArrayClass<T>> result = jni::JArrayClass<T>::newArray(size);
    for (size_t i = 0; i < size; i++) {
      result->setElement(i, JSIConverter<T>::fromJSI(runtime, array.getValueAtIndex(runtime, i)));
    }
    return result;
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, const jni::alias_ref<jni::JArrayClass<T>>& arg) {
    size_t size = arg->size();
    jsi::Array array = jsi::Array(runtime, size);
    for (size_t i = 0; i < size; i++) {
      array.setValueAtIndex(runtime, i, JSIConverter<T>::toJSI(runtime, arg->getElement(i)));
    }
    return array;
  }
  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    if (!value.isObject()) {
      return false;
    }
    jsi::Object object = value.getObject(runtime);
    if (!object.isArray(runtime)) {
      return false;
    }
    jsi::Array array = object.getArray(runtime);
    if (array.size(runtime) == 0) {
      // If it's an empty array we simply don't know it's value type.
      return true;
    }
    jsi::Value firstElement = array.getValueAtIndex(runtime, 0);
    return JSIConverter<T>::canConvert(runtime, firstElement);
  }
};

// number[] <> JArrayDouble
template <>
struct JSIConverter<jni::alias_ref<jni::JArrayDouble>> final {
  static inline jni::local_ref<jni::JArrayDouble> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    jsi::Object object = arg.asObject(runtime);
    jsi::Array array = object.asArray(runtime);
    size_t size = array.size(runtime);

    auto data = new double[size];
    for (size_t i = 0; i < size; i++) {
      data[i] = array.getValueAtIndex(runtime, i).asNumber();
    }
    jni::local_ref<jni::JArrayDouble> result = jni::JArrayDouble::newArray(size);
    result->setRegion(0, static_cast<jsize>(size), data);
    delete[] data;
    return result;
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, jni::alias_ref<jni::JArrayDouble>& arg) {
    size_t size = arg->size();
    jsi::Array array = jsi::Array(runtime, size);
    std::unique_ptr<double[]> region = arg->getRegion(0, static_cast<jsize>(size));
    for (size_t i = 0; i < size; i++) {
      array.setValueAtIndex(runtime, i, jsi::Value(region[i]));
    }
    return array;
  }
  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    if (!value.isObject()) {
      return false;
    }
    jsi::Object object = value.getObject(runtime);
    jsi::Array array = object.getArray(runtime);
    if (array.size(runtime) == 0) {
      // If it's an empty array we simply don't know it's value type.
      return true;
    }
    return array.getValueAtIndex(runtime, 0).isNumber();
  }
};

// boolean[] <> JArrayBoolean
template <>
struct JSIConverter<jni::alias_ref<jni::JArrayBoolean>> final {
  static inline jni::local_ref<jni::JArrayBoolean> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    jsi::Object object = arg.asObject(runtime);
    jsi::Array array = object.asArray(runtime);
    size_t size = array.size(runtime);

    auto data = new jboolean[size];
    for (size_t i = 0; i < size; i++) {
      data[i] = static_cast<bool>(array.getValueAtIndex(runtime, i).asBool());
    }
    jni::local_ref<jni::JArrayBoolean> result = jni::JArrayBoolean::newArray(size);
    result->setRegion(0, static_cast<jsize>(size), data);
    delete[] data;
    return result;
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, jni::alias_ref<jni::JArrayBoolean>& arg) {
    size_t size = arg->size();
    jsi::Array array = jsi::Array(runtime, size);
    std::unique_ptr<jboolean[]> region = arg->getRegion(0, static_cast<jsize>(size));
    for (size_t i = 0; i < size; i++) {
      array.setValueAtIndex(runtime, i, jsi::Value(static_cast<bool>(region[i])));
    }
    return array;
  }
  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    if (!value.isObject()) {
      return false;
    }
    jsi::Object object = value.getObject(runtime);
    jsi::Array array = object.getArray(runtime);
    if (array.size(runtime) == 0) {
      // If it's an empty array we simply don't know it's value type.
      return true;
    }
    return array.getValueAtIndex(runtime, 0).isBool();
  }
};

// long[] <> JArrayLong
template <>
struct JSIConverter<jni::alias_ref<jni::JArrayLong>> final {
  static inline jni::local_ref<jni::JArrayLong> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    jsi::Object object = arg.asObject(runtime);
    jsi::Array array = object.asArray(runtime);
    size_t size = array.size(runtime);

    auto data = new jlong[size];
    for (size_t i = 0; i < size; i++) {
      data[i] = array.getValueAtIndex(runtime, i).asBigInt(runtime).asInt64(runtime);
    }
    jni::local_ref<jni::JArrayLong> result = jni::JArrayLong::newArray(size);
    result->setRegion(0, static_cast<jsize>(size), data);
    delete[] data;
    return result;
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, jni::alias_ref<jni::JArrayLong>& arg) {
    size_t size = arg->size();
    jsi::Array array = jsi::Array(runtime, size);
    std::unique_ptr<jlong[]> region = arg->getRegion(0, static_cast<jsize>(size));
    for (size_t i = 0; i < size; i++) {
      array.setValueAtIndex(runtime, i, jsi::Value(static_cast<bool>(region[i])));
    }
    return array;
  }
  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    if (!value.isObject()) {
      return false;
    }
    jsi::Object object = value.getObject(runtime);
    jsi::Array array = object.getArray(runtime);
    if (array.size(runtime) == 0) {
      // If it's an empty array we simply don't know it's value type.
      return true;
    }
    return array.getValueAtIndex(runtime, 0).isBigInt();
  }
};

// {} <> JMap
template <typename K, typename V>
struct JSIConverter<jni::alias_ref<jni::JMap<K, V>>> final {
  static inline jni::local_ref<jni::JMap<K, V>> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    jsi::Object object = arg.asObject(runtime);
    jsi::Array propertyNames = object.getPropertyNames(runtime);
    size_t size = propertyNames.size(runtime);
    jni::local_ref<jni::JHashMap<K, V>> map = jni::JHashMap<K, V>::create(size);
    for (size_t i = 0; i < size; i++) {
      jsi::Value key = propertyNames.getValueAtIndex(runtime, i);
      jsi::Value value = object.getProperty(runtime, key.asString(runtime));
      map->put(JSIConverter<K>::fromJSI(runtime, key), JSIConverter<V>::fromJSI(runtime, value));
    }
    return map;
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, jni::alias_ref<jni::JMap<K, V>> arg) {
    jsi::Object object = jsi::Object(runtime);
    size_t size = arg->size();
    for (const auto& entry : *arg) {
      jsi::String key = jsi::String::createFromUtf8(runtime, entry.first->toStdString());
      object.setProperty(runtime, key, JSIConverter<V>::toJSI(runtime, entry.second));
    }
    return object;
  }
  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    if (!value.isObject()) {
      return false;
    }
    jsi::Object object = value.getObject(runtime);
    return isPlainObject(runtime, object);
  }
};

} // namespace margelo::nitro
