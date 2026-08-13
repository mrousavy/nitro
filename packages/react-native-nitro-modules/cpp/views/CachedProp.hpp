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
  /**
   * Whether this prop ever received a value from JS.
   * A prop that was never set by JS still holds a default-constructed `value`,
   * which must not be applied to the View.
   */
  bool hasValue() const noexcept {
    return jsiValue != nullptr;
  }

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
    BorrowingReference<jsi::Value> cached;
    {
      JSICacheReference cache = JSICache::getOrCreateCache(runtime);
      cached = cache.makeShared(jsi::Value(runtime, value));
    }
    return CachedProp<T>(std::move(converted), std::move(cached));
  }
};

} // namespace margelo::nitro
