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

namespace margelo::nitro {

using namespace facebook;

/**
 * A React prop (via `RawProps`) that can be cached against its previous
 * JS value (via `jsi::Value::strictEquals(...)`) and stores an `isDirty`
 * flag for incremental updates.
 */
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
  static CachedProp<T> fromJSIValue(jsi::Runtime& runtime, const jsi::Value& value, const CachedProp<T>& oldProp) {
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
        return CachedProp<T>::fromRawValue(*runtime, function, previousProp);
      } else {
        return CachedProp<T>::fromRawValue(*runtime, value, previousProp);
      }
    } catch (const std::exception& exception) {
      throw std::runtime_error(std::string(viewName) + "." + propName + ": " + exception.what());
    }
  }

  [[deprecated("Update nitrogen and re-generate specs.")]]
  static CachedProp<T> fromRawValue(jsi::Runtime& runtime, const jsi::Value& value, const CachedProp<T>& oldProp) {
    return fromJSIValue(runtime, value, oldProp);
  }
};

} // namespace margelo::nitro
