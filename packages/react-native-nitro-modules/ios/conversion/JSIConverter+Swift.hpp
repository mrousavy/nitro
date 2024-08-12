//
// Created by Marc Rousavy on 12.08.24.
//

//
//
//
// ⚠️ This header can only be included if a -Swift.h bridging ⚠️
//         header has already included before this one!
//
//
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
template <typename T, typename Enable>
struct JSIConverter;
} // namespace margelo::nitro

#include "JSIConverter.hpp"

#include <jsi/jsi.h>
#include <vector>

namespace swift {
// swift::String
class String;

// swift::Optional<T>
template<typename T>
#ifdef __cpp_concepts
requires swift::isUsableInGenericContext<T>
#endif
class Optional;

// swift::Array<T>
template<typename T>
#ifdef __cpp_concepts
requires swift::isUsableInGenericContext<T>
#endif
class Array;
} // namespace swift

namespace margelo::nitro {

// swift::String <> string
template<>
struct JSIConverter<swift::String> {
  static inline swift::String fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    return arg.asString(runtime).utf8(runtime);
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, const swift::String& arg) {
    return jsi::String::createFromUtf8(runtime, std::string(arg));
  }
  static inline bool canConvert(jsi::Runtime&, const jsi::Value& value) {
    return value.isString();
  }
};

// swift::Optional<T> <> T | undefined
template <typename TInner>
struct JSIConverter<swift::Optional<TInner>> {
  static inline swift::Optional<TInner> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    if (arg.isUndefined() || arg.isNull()) {
      return swift::Optional<TInner>::none();
    } else {
      return swift::Optional<TInner>::some(JSIConverter<TInner>::fromJSI(runtime, arg));
    }
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, const swift::Optional<TInner>& arg) {
    if (arg.isNone()) {
      return jsi::Value::undefined();
    } else {
      return JSIConverter<TInner>::toJSI(runtime, arg.get());
    }
  }
  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    if (value.isUndefined() || value.isNull()) {
      return true;
    }
    if (JSIConverter<TInner>::canConvert(runtime, value)) {
      return true;
    }
    return false;
  }
};

// swift::Array<T> <> T[]
template <typename ElementType>
struct JSIConverter<swift::Array<ElementType>> {

  static inline swift::Array<ElementType> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    jsi::Array array = arg.asObject(runtime).asArray(runtime);
    size_t length = array.size(runtime);

    auto result = swift::Array<ElementType>::init();
    result.reserveCapacity(length);
    for (size_t i = 0; i < length; ++i) {
      jsi::Value elementValue = array.getValueAtIndex(runtime, i);
      result.append(JSIConverter<ElementType>::fromJSI(runtime, elementValue));
    }
    return result;
  }

  static inline jsi::Value toJSI(jsi::Runtime& runtime, const swift::Array<ElementType>& arg) {
    jsi::Array array(runtime, arg.getCount());
    for (size_t i = 0; i < arg.getCount(); i++) {
      jsi::Value value = JSIConverter<ElementType>::toJSI(runtime, arg[i]);
      array.setValueAtIndex(runtime, i, std::move(value));
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
      // it is an empty array, so it _theoretically_ doesn't matter what type it holds. Just say true.
      return true;
    }
    // Check the type of the first element in the array.
    // Technically the array can also have different types for each item,
    // and to be absolutely sure that we can convert the entire array, we have to check each item in the array.
    // But we don't want to do that for performance reasons - let's just assume the user doesn't make this mistake.
    jsi::Value firstElement = array.getValueAtIndex(runtime, 0);
    return JSIConverter<ElementType>::canConvert(runtime, firstElement);
  }
};

}
