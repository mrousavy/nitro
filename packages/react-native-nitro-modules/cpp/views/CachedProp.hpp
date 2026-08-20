//
// Created by Marc Rousavy on 30.07.24.
//

#pragma once

#include "BorrowingReference.hpp"
#include "IsFunctionProp.hpp"
#include "JSIConverter.hpp"
#include "NitroDefines.hpp"
#include "PropNameIDCache.hpp"
#include <jsi/jsi.h>

#include <react/renderer/core/RawProps.h>
#include <react/renderer/core/RawValue.h>

#include <memory>
#include <utility>

namespace margelo::nitro {

using namespace facebook;

/**
 * A React prop (via `RawProps`) that caches its converted value against the
 * original JS value (via `jsi::Value::strictEquals(...)`).
 *
 * Copies of an unchanged prop share the same immutable entry, which provides
 * a stable identity for comparing two Fabric Props snapshots.
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

  std::shared_ptr<const Entry> _entry;

public:
  bool isDirty = false;

  // Default constructor
  CachedProp() : _entry(std::make_shared<const Entry>()) {}
  // Constructor with value
  CachedProp(T&& value, BorrowingReference<jsi::Value>&& jsiValue)
      : _entry(std::make_shared<const Entry>(std::move(value), std::move(jsiValue))), isDirty(true) {}
  // Copy/Move/Destruct
  CachedProp(const CachedProp&) = default;
  CachedProp(CachedProp&&) = default;
  CachedProp& operator=(const CachedProp&) = default;
  CachedProp& operator=(CachedProp&&) = default;
  ~CachedProp() = default;

public:
  [[nodiscard]]
  const T& get() const noexcept {
    return _entry->value;
  }

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
  static CachedProp<T> fromRawValue(const char* viewName, const char* propName, const react::RawProps& rawProps,
                                    const CachedProp<T>& previousProp) {
    try {
      const react::RawValue* rawValue = rawProps.at(propName, nullptr, nullptr);
      if (rawValue == nullptr) {
        // This RawValue pack does not contain our prop, so skip it - it's still the same from before
        return previousProp;
      }

      auto [runtime, value] = static_cast<std::pair<jsi::Runtime*, jsi::Value>>(*rawValue);

      if constexpr (IsFunctionProp<std::remove_cv_t<T>>::value) {
        // React Native cannot transport functions as regular props. Nitrogen
        // wraps them as `{ f: function }`, so we unwrap `f` before converting
        // and caching the JSI value.
        jsi::Value function = value.asObject(*runtime).getProperty(*runtime, PropNameIDCache::get(*runtime, "f"));
        return CachedProp<T>::fromJSIValue(*runtime, std::move(function), previousProp);
      } else {
        return CachedProp<T>::fromJSIValue(*runtime, std::move(value), previousProp);
      }
    } catch (const std::exception& exception) {
      throw std::runtime_error(std::string(viewName) + "." + propName + ": " + exception.what());
    }
  }

  [[deprecated("Update nitrogen and re-generate specs.")]]
  static CachedProp<T> fromRawValue(jsi::Runtime& runtime, const jsi::Value& value, const CachedProp<T>& oldProp) {
    if (oldProp.equals(runtime, value)) {
      return oldProp;
    }

    return convertAndCacheJSIValue(runtime, jsi::Value(runtime, value));
  }

private:
  static CachedProp<T> fromJSIValue(jsi::Runtime& runtime, jsi::Value&& value, const CachedProp<T>& previousProp) {
    if (previousProp.equals(runtime, value)) {
      // jsi::Value hasn't changed - no need to convert it again!
      return previousProp;
    }
    // The new `value` differs from our previous value, so let's convert it using JSIConverter and cache it
    return convertAndCacheJSIValue(runtime, std::move(value));
  }
  static CachedProp<T> convertAndCacheJSIValue(jsi::Runtime& runtime, jsi::Value&& value) {
    T converted = JSIConverter<T>::fromJSI(runtime, value);
    JSICacheReference cache = JSICache::getOrCreateCache(runtime);
    BorrowingReference<jsi::Value> cached = cache.makeShared(std::move(value));
    return CachedProp<T>(std::move(converted), std::move(cached));
  }
};

} // namespace margelo::nitro
