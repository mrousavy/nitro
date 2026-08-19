//
// Created by Marc Rousavy on 30.07.24.
//

#pragma once

#include "BorrowingReference.hpp"
#include "JSIConverter.hpp"
#include "NitroDefines.hpp"
#include <jsi/jsi.h>
#include <memory>
#include <utility>

namespace margelo::nitro {

using namespace facebook;

/**
 * A React prop (via `RawProps`) that caches its converted value against the
 * original JS value (via `jsi::Value::strictEquals(...)`).
 *
 * `CachedProp` is immutable after construction. Copies of an unchanged prop
 * share the same entry, which acts as a stable identity for comparing two
 * Fabric Props snapshots without comparing `T` itself.
 */
template <typename T>
class CachedProp final {
private:
  struct Entry final {
    T value{};
    BorrowingReference<jsi::Value> jsiValue;

    Entry() = default;
    Entry(T&& value, BorrowingReference<jsi::Value>&& jsiValue) : value(std::move(value)), jsiValue(std::move(jsiValue)) {}
  };

public:
  // Default constructor
  CachedProp() : _entry(std::make_shared<const Entry>()) {}
  // Copy/Move/Destruct
  CachedProp(const CachedProp&) = default;
  CachedProp(CachedProp&&) = default;
  ~CachedProp() = default;

private:
  // Constructor with value
  CachedProp(T&& value, BorrowingReference<jsi::Value>&& jsiValue)
      : _entry(std::make_shared<const Entry>(std::move(value), std::move(jsiValue))) {}

public:
  [[nodiscard]]
  const T& get() const noexcept {
    return _entry->value;
  }

  /**
   * Returns whether this prop and `other` originate from the same conversion.
   */
  [[nodiscard]]
  bool hasSameValue(const CachedProp<T>& other) const noexcept {
    return _entry == other._entry;
  }

private:
  bool equals(jsi::Runtime& runtime, const jsi::Value& other) const {
    if (_entry->jsiValue == nullptr) {
      return false;
    }
    return jsi::Value::strictEquals(runtime, *_entry->jsiValue, other);
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

private:
  std::shared_ptr<const Entry> _entry;
};

} // namespace margelo::nitro
