//
// Created by Marc Rousavy on 30.07.24.
//

#pragma once

#include "JSIConverter.hpp"
#include "NitroDefines.hpp"
#include "OwningReference.hpp"
#include <jsi/jsi.h>

namespace margelo::nitro {

using namespace facebook;

template <typename T>
struct CachedProp {
public:
  T value;
  OwningReference<jsi::Value> jsiValue;
  bool isDirty;

public:
  bool equals(jsi::Runtime& runtime, const jsi::Value& other) const {
    if (!jsiValue)
      return false;
    return jsi::Value::strictEquals(runtime, *jsiValue, other);
  }

public:
  static CachedProp<T> fromRawValue(jsi::Runtime& runtime, const jsi::Value& value, const CachedProp<T>& oldProp) {
    if (oldProp.equals(runtime, value)) {
      // jsi::Value hasn't changed - no need to convert it again!
      return oldProp;
    }
    auto converted = JSIConverter<T>::fromJSI(runtime, value);
    auto cache = JSICache::getOrCreateCache(runtime);
    auto cached = cache.makeShared(jsi::Value(runtime, value));
    return CachedProp<T>(std::move(converted), std::move(cached), /* isDirty */ true);
  }
};

} // namespace margelo::nitro
