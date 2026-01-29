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
  BorrowingReference<jsi::Value> jsiValue;
  bool isDirty = false;

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
    T converted = JSIConverter<T>::fromJSI(runtime, value);
    BorrowingReference<jsi::Value cached;
    {
      JSICacheReference cache = JSICache::getOrCreateCache(runtime);
      cached = cache.makeShared(jsi::Value(runtime, value));
    }
    return CachedProp<T>(std::move(converted), std::move(cached), /* isDirty */ true);
  }
};

} // namespace margelo::nitro
