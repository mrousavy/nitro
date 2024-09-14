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

namespace margelo::nitro {

using namespace facebook;

// number[] <> JArrayDouble
template <>
struct JSIConverter<jni::JArrayDouble> final {
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
  static inline jsi::Value toJSI(jsi::Runtime& runtime, jni::alias_ref<jni::JArrayDouble> arg) {
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
struct JSIConverter<jni::JArrayBoolean> final {
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
struct JSIConverter<jni::JArrayLong> final {
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

} // namespace margelo::nitro
