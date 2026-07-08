//
// Created by Marc Rousavy on 30.07.24.
//

#pragma once

#include "BorrowingReference.hpp"
#include "JSIConverter.hpp"
#include "NitroDefines.hpp"
#include <jsi/jsi.h>

namespace margelo::nitro {

using namespace facebook;

template <typename T>
struct CachedProp {
public:
  T value;
  bool isDirty = false;

  // Default constructor
  CachedProp() = default;
  // Constructor with value
  CachedProp(T&& value, BorrowingReference<jsi::Value>&& jsiValue)
      : value(std::move(value)), isDirty(true), jsiValue(std::move(jsiValue)) {}
  // Copy/Move/Destruct
  CachedProp(const CachedProp&) = default;
  CachedProp(CachedProp&&) = default;
  ~CachedProp() = default;

private:
  BorrowingReference<jsi::Value> jsiValue;

public:
  bool equals(jsi::Runtime& runtime, const jsi::Value& other) const {
    if (jsiValue == nullptr) {
      return false;
    }
    return jsi::Value::strictEquals(runtime, *jsiValue, other);
  }

public:
  static CachedProp<T> fromRawValue(jsi::Runtime& runtime, const jsi::Value& value, const CachedProp<T>& oldProp) {
    if (oldProp.equals(runtime, value)) {
      // jsi::Value hasn't changed - no need to convert it again!
      return oldProp;
    }
    T converted = convertFromJSI(runtime, value);
    BorrowingReference<jsi::Value> cached;
    {
      JSICacheReference cache = JSICache::getOrCreateCache(runtime);
      cached = cache.makeShared(jsi::Value(runtime, value));
    }
    return CachedProp<T>(std::move(converted), std::move(cached));
  }

private:
  static T convertFromJSI(jsi::Runtime& runtime, const jsi::Value& value) {
    if (value.isNull() && !JSIConverter<T>::canConvert(runtime, value)) {
      // React encodes removed (or explicitly `undefined`) props as `null` - unless T
      // explicitly models null (e.g. `string | null`), treat it as `undefined`.
      // See https://github.com/mrousavy/nitro/issues/1184 and
      // https://github.com/facebook/react-native/blob/v0.85.3/packages/react-native/Libraries/ReactNative/ReactFabricPublicInstance/ReactNativeAttributePayload.js#L270-L277
      jsi::Value undefined = jsi::Value::undefined();
      if (JSIConverter<T>::canConvert(runtime, undefined)) {
        return JSIConverter<T>::fromJSI(runtime, undefined);
      }
      // T can't represent "no value" either (required prop) - fall through so
      // the error reports the actual (null) value.
    }
    return JSIConverter<T>::fromJSI(runtime, value);
  }
};

} // namespace margelo::nitro
