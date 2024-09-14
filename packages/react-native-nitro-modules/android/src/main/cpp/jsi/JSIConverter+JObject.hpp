//
// Created by Marc Rousavy on 21.02.24.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
template <typename T, typename Enable>
struct JSIConverter;
} // namespace margelo::nitro

#include "JSIConverter+BoxedPrimitives.hpp"
#include "JSIConverter+JArrayClass.hpp"
#include "JSIConverter+JMap.hpp"
#include "JSIConverter+JString.hpp"
#include "JSIConverter.hpp"
#include <fbjni/fbjni.h>
#include <jni.h>
#include <jsi/jsi.h>

namespace margelo::nitro {

using namespace facebook;

template <>
struct JSIConverter<jni::JObject> final {
  static inline jsi::Value toJSI(jsi::Runtime& runtime, jni::alias_ref<jni::JObject> boxedValue) {
    if (boxedValue->isInstanceOf(jni::JDouble::javaClassStatic())) {
      // It's a double
      return JSIConverter<jni::JDouble>::toJSI(runtime, jni::static_ref_cast<jni::JDouble>(boxedValue));
    } else if (boxedValue->isInstanceOf(jni::JBoolean::javaClassStatic())) {
      // It's a boolean
      return JSIConverter<jni::JBoolean>::toJSI(runtime, jni::static_ref_cast<jni::JBoolean>(boxedValue));
    } else if (boxedValue->isInstanceOf(jni::JLong::javaClassStatic())) {
      // It's a long
      return JSIConverter<jni::JLong>::toJSI(runtime, jni::static_ref_cast<jni::JLong>(boxedValue));
    } else if (boxedValue->isInstanceOf(jni::JString::javaClassStatic())) {
      // It's a string
      return JSIConverter<jni::JString>::toJSI(runtime, jni::static_ref_cast<jni::JString>(boxedValue));
    } else if (boxedValue->isInstanceOf(jni::JArrayClass<jni::JObject>::javaClassStatic())) {
      // It's an array
      return JSIConverter<jni::JArrayClass<jni::JObject>>::toJSI(runtime, jni::static_ref_cast<jni::JArrayClass<jni::JObject>>(boxedValue));
    } else if (boxedValue->isInstanceOf(jni::JMap<jni::JString, jni::JObject>::javaClassStatic())) {
      // It's a map
      return JSIConverter<jni::JMap<jni::JString, jni::JObject>>::toJSI(
          runtime, jni::static_ref_cast<jni::JMap<jni::JString, jni::JObject>>(boxedValue));
    } else [[unlikely]] {
      // It's an unknown type! Let's give the developer some hints..
      if (boxedValue->isInstanceOf(jni::JInteger::javaClassStatic())) {
        throw std::runtime_error("Cannot convert Integer \"" + boxedValue->toString() +
                                 "\" to jsi::Value! JavaScript uses Doubles for numbers.");
      } else {
        throw std::runtime_error("Cannot convert \"" + boxedValue->toString() + "\" to jsi::Value!");
      }
    }
  }
  static inline jni::local_ref<jni::JObject> fromJSI(jsi::Runtime& runtime, const jsi::Value& value) {
    if (JSIConverter<jni::JDouble>::canConvert(runtime, value)) {
      // It's a double
      return JSIConverter<jni::JDouble>::fromJSI(runtime, value);
    } else if (JSIConverter<jni::JBoolean>::canConvert(runtime, value)) {
      // It's a boolean
      return JSIConverter<jni::JBoolean>::fromJSI(runtime, value);
    } else if (JSIConverter<jni::JLong>::canConvert(runtime, value)) {
      // It's a long
      return JSIConverter<jni::JLong>::fromJSI(runtime, value);
    } else if (JSIConverter<jni::JString>::canConvert(runtime, value)) {
      // It's a string
      return JSIConverter<jni::JString>::fromJSI(runtime, value);
    } else if (JSIConverter<jni::JArrayClass<jni::JObject>>::canConvert(runtime, value)) {
      // It's an array
      return JSIConverter<jni::JArrayClass<jni::JObject>>::fromJSI(runtime, value);
    } else if (JSIConverter<jni::JMap<jni::JString, jni::JObject>>::canConvert(runtime, value)) {
      // It's a map
#ifndef NDEBUG
      if (!isPlainObject(runtime, value.asObject(runtime))) [[unlikely]] {
        std::string stringRepresentation = value.toString(runtime).utf8(runtime);
        throw std::runtime_error("Cannot convert \"" + stringRepresentation + "\" to JObject!");
      }
#endif
      return JSIConverter<jni::JMap<jni::JString, jni::JObject>>::fromJSI(runtime, value);
    } else [[unlikely]] {
      std::string stringRepresentation = value.toString(runtime).utf8(runtime);
      throw std::runtime_error("Cannot convert \"" + stringRepresentation + "\" to JObject!");
    }
  }
  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    if (JSIConverter<jni::JDouble>::canConvert(runtime, value)) {
      return true;
    } else if (JSIConverter<jni::JBoolean>::canConvert(runtime, value)) {
      return true;
    } else if (JSIConverter<jni::JLong>::canConvert(runtime, value)) {
      return true;
    } else if (JSIConverter<jni::JString>::canConvert(runtime, value)) {
      return true;
    } else if (JSIConverter<jni::JArrayClass<jni::JObject>>::canConvert(runtime, value)) {
      return true;
    } else if (JSIConverter<jni::JMap<jni::JString, jni::JObject>>::canConvert(runtime, value)) {
      return true;
    }
    return false;
  }
};

} // namespace margelo::nitro
