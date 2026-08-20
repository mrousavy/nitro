//
// Created by Marc Rousavy on 30.07.24.
//

#pragma once

#include "BorrowingReference.hpp"
#include "IsFunctionProp.hpp"
#include "JSIConverter.hpp"
#include "NitroDefines.hpp"
#include "PropNameIDCache.hpp"
#include "RawPropsCompat.hpp"
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
    bool isProvided{false};

    Entry() = default;
    Entry(T&& value, BorrowingReference<jsi::Value>&& jsiValue)
        : value(std::move(value)), jsiValue(std::move(jsiValue)), isProvided(true) {}
  };

  std::shared_ptr<const Entry> _entry;

public:
  // Default constructor
  CachedProp() : _entry(std::make_shared<const Entry>()) {}
  // Constructor with value
  CachedProp(T&& value, BorrowingReference<jsi::Value>&& jsiValue)
      : _entry(std::make_shared<const Entry>(std::move(value), std::move(jsiValue))) {}
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

  /**
   * Returns whether this prop has an explicit value in the current Fabric
   * Props snapshot. Omitted props inherit this immutable state from the
   * previous snapshot.
   */
  [[nodiscard]]
  bool isProvided() const noexcept {
    return _entry->isProvided;
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
      const react::RawValue* rawValue = RawPropsCompat::at(rawProps, propName);
      if (rawValue == nullptr) {
        // This RawValue pack does not contain our prop, so skip it - it's still the same from before
        return previousProp;
      }

      auto [runtime, value] = static_cast<std::pair<jsi::Runtime*, jsi::Value>>(*rawValue);

#if NITRO_RAW_FUNCTION_PROPS
      // Every prop - including functions - arrives as the raw JSI value it was
      // in JS, so there is nothing to unwrap here.
      return CachedProp<T>::fromJSIValue(*runtime, std::move(value), previousProp);
#else
      if constexpr (IsFunctionProp<std::remove_cv_t<T>>::value) {
        // This version of React Native cannot transport functions as props, so
        // `callback(...)` wraps them as `{ f: function }` - unwrap `f` before
        // converting and caching the JSI value.
        return CachedProp<T>::fromJSIValue(*runtime, unwrapWrappedCallback(*runtime, std::move(value)), previousProp);
      } else {
        return CachedProp<T>::fromJSIValue(*runtime, std::move(value), previousProp);
      }
#endif
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
#if !NITRO_RAW_FUNCTION_PROPS
  /**
   * Unwraps the actual JS function from a `{ f: function }` object created by
   * `callback(...)`, which is how functions are passed to Nitro Views before
   * React Native 0.81.
   */
  static jsi::Value unwrapWrappedCallback(jsi::Runtime& runtime, jsi::Value&& value) {
    if (value.isNull() || value.isUndefined()) {
      // The function prop has been removed - there is nothing to unwrap.
      return std::move(value);
    }
    if (!value.isObject()) {
      throw std::runtime_error("Expected a function wrapped via `callback(...)`, but got `" + value.toString(runtime).utf8(runtime) +
                               "`! On react-native 0.78 - 0.80, function props have to be wrapped in `callback(...)`. "
                               "Alternatively, upgrade to react-native 0.81 or newer where Nitro passes functions to native directly.");
    }
    return value.asObject(runtime).getProperty(runtime, PropNameIDCache::get(runtime, "f"));
  }
#endif

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
